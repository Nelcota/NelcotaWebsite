/**
 * Applies the repository's Portuguese catalogs (docs/i18n/pt-BR/*.json) to a
 * parsed Markdown document. It follows the contract of the admin panel
 * (crates/admin/ui/src/lib/features/guides/prose.ts): catalog keys are exact
 * prose fragments as `marked` tokenizes them (headings, paragraphs, list item
 * text and table cells). Code blocks, inline code and link destinations always
 * come from the English source. Keep `marked` on the same version as the panel.
 *
 * No `astro:*` imports: scripts/sync-docs.ts uses it to report catalog gaps.
 */
import { Lexer, type Token, type Tokens } from 'marked';

export type TranslationCatalog = Readonly<Record<string, string>>;
type Prose = Tokens.Heading | Tokens.Paragraph | Tokens.Text | Tokens.TableCell;

const LETTER = /\p{L}/u;

function proseText(tokens: readonly Token[]): string {
  return tokens
    .map((token) => {
      if (token.type === 'codespan' || token.type === 'html') return '';
      if ('tokens' in token && token.tokens != null) return proseText(token.tokens);

      return 'text' in token ? token.text : '';
    })
    .join('');
}

/** Fragments made only of code, links or punctuation have nothing to translate. */
function needsTranslation(text: string): boolean {
  return LETTER.test(proseText(Lexer.lexInline(text)));
}

/** Visits complete prose fragments, never code blocks or their comments. */
function visitProse(tokens: readonly Token[], apply: (fragment: Prose) => void): void {
  for (const token of tokens) {
    if (token.type === 'heading' || token.type === 'paragraph') {
      apply(token as Prose);
      continue;
    }
    if (token.type === 'text' && token.tokens != null) {
      apply(token as Tokens.Text);
      continue;
    }
    if (token.type === 'table') {
      const table = token as Tokens.Table;
      for (const cell of [...table.header, ...table.rows.flat()]) apply(cell);
      continue;
    }
    if (token.type === 'list') {
      for (const item of (token as Tokens.List).items) visitProse(item.tokens, apply);
      continue;
    }
    if (token.type === 'blockquote') visitProse((token as Tokens.Blockquote).tokens, apply);
  }
}

export function proseFragments(markdown: string): string[] {
  const fragments = new Set<string>();
  visitProse(Lexer.lex(markdown), (fragment) => {
    if (needsTranslation(fragment.text)) fragments.add(fragment.text);
  });

  return [...fragments];
}

/** Inline code and destinations are part of a translation's contract. */
function protectedInline(markdown: string): string {
  const code: string[] = [];
  const links: string[] = [];
  const walk = (tokens: readonly Token[]): void => {
    for (const token of tokens) {
      if (token.type === 'codespan') code.push(token.text);
      if (token.type === 'link' || token.type === 'image') links.push(token.href);
      if ('tokens' in token && token.tokens != null) walk(token.tokens);
    }
  };
  walk(Lexer.lexInline(markdown));

  return JSON.stringify([code.toSorted(), links.toSorted()]);
}

export interface CatalogReport {
  readonly missing: readonly string[];
  readonly outdated: readonly string[];
  /** Translations whose inline code or link destinations differ from the source. */
  readonly changed: readonly string[];
}

export function checkCatalog(markdown: string, catalog: TranslationCatalog): CatalogReport {
  const fragments = proseFragments(markdown);
  const current = new Set(fragments);
  const missing: string[] = [];
  const changed: string[] = [];

  for (const fragment of fragments) {
    const translated = catalog[fragment];
    if (translated == null || translated.trim().length === 0) {
      missing.push(fragment);
      continue;
    }
    if (protectedInline(fragment) !== protectedInline(translated)) changed.push(fragment);
  }
  const outdated = Object.keys(catalog).filter((key) => !current.has(key));

  return { missing, outdated, changed };
}

/**
 * Translates the token tree in place. A fragment without a valid translation
 * keeps its English text and is counted, so the page can say it is partial.
 */
export function translateTokens(tokens: Token[], catalog: TranslationCatalog): number {
  let untranslated = 0;
  visitProse(tokens, (fragment) => {
    if (!needsTranslation(fragment.text)) return;

    const translated = catalog[fragment.text];
    const isValid =
      translated != null &&
      translated.trim().length > 0 &&
      protectedInline(fragment.text) === protectedInline(translated);
    if (!isValid) {
      untranslated += 1;
      return;
    }

    fragment.text = translated;
    fragment.tokens = Lexer.lexInline(translated);
  });

  return untranslated;
}

/** Parses a catalog file: a flat JSON object of strings. */
export function parseCatalog(json: string, path: string): TranslationCatalog {
  const value: unknown = JSON.parse(json);
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${path}: a catalog must be a JSON object`);
  }

  const entries = Object.entries(value);
  const invalid = entries.find(([, text]) => typeof text !== 'string');
  if (invalid != null) throw new TypeError(`${path}: value of "${invalid[0]}" is not a string`);

  return Object.fromEntries(entries) as Record<string, string>;
}
