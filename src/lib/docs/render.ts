/**
 * Renders one repository Markdown file into the HTML of a /docs page, plus the
 * data around it: table of contents, search sections and internal links.
 *
 * Security: only repository text is parsed, raw HTML is escaped, and links
 * are limited to http(s), mailto and in-page anchors. Code is highlighted at
 * build time into classes (src/lib/highlight.ts), so pages keep a strict CSP.
 */
import { Marked, type Token, type Tokens } from 'marked';
import { type CodeLang, escapeHtml, type HighlightRegistry } from '../highlight.ts';
import { type TranslationCatalog, translateTokens } from './translate.ts';

export interface DocHeading {
  readonly id: string;
  readonly text: string;
  readonly level: number;
}

/** One searchable slice of a page: the text between two headings. */
export interface DocSection {
  readonly anchor: string;
  readonly heading: string;
  readonly text: string;
}

export interface InternalLink {
  readonly page: string;
  readonly anchor: string;
}

export interface RenderedDoc {
  readonly title: string;
  readonly lead: string;
  readonly html: string;
  readonly headings: readonly DocHeading[];
  readonly sections: readonly DocSection[];
  readonly links: readonly InternalLink[];
  /** Prose fragments shown in English because the catalog has no valid translation. */
  readonly untranslated: number;
}

export interface RenderOptions {
  readonly source: string;
  readonly catalog: TranslationCatalog | undefined;
  readonly registry: HighlightRegistry;
  /** Page id for a repository path, when that file is published under /docs. */
  readonly pageForSource: (path: string) => string | undefined;
  readonly pageUrl: (page: string, anchor: string) => string;
  readonly repoFileUrl: (path: string, anchor: string) => string;
  /** Title of a published page, shown instead of a bare file name as link text. */
  readonly pageTitle: (page: string) => string | undefined;
  readonly spriteUrl: string;
  readonly labels: {
    readonly copy: string;
    readonly copied: string;
    readonly copyFailed: string;
    readonly sectionLink: string;
    readonly table: string;
  };
}

const LANGS: Readonly<Record<string, CodeLang>> = {
  sh: 'shellscript',
  bash: 'shellscript',
  shell: 'shellscript',
  console: 'shellscript',
  ts: 'typescript',
  typescript: 'typescript',
  js: 'typescript',
  javascript: 'typescript',
  rust: 'rust',
  rs: 'rust',
  sql: 'sql',
  toml: 'toml',
  json: 'json',
  http: 'http',
};

const CAPTIONS: Readonly<Record<string, string>> = {
  sh: 'shell',
  bash: 'shell',
  shell: 'shell',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  js: 'JavaScript',
  javascript: 'JavaScript',
  rust: 'Rust',
  sql: 'SQL',
  toml: 'TOML',
  json: 'JSON',
  text: 'text',
};

const REPO_HOSTS = new Set(['github.com', 'www.github.com']);
/** Links written before the organization transfer still point at the old owner. */
const REPO_PREFIXES = ['Nelcota/Nelcota/', 'HanielCota/Nelcota/'];
const PLACEHOLDER_ORIGIN = 'https://repo.invalid';
const MAX_SECTION_TEXT = 1600;
/** h1 is the page title, so body headings start at h2. */
const MIN_HEADING_LEVEL = 2;

/** A published page must open with a "# Title" line: it names the page and its tab. */
export class MissingTitleError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'MissingTitleError';
  }
}

/** GitHub-style anchor, identical to the admin panel's, so section links match. */
export function headingSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\-\s]/gu, '')
    .replace(/\s/g, '-');
}

/** decodeURIComponent that reports a malformed `%` escape instead of crashing the build. */
function safeDecode(value: string, source: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch (error: unknown) {
    console.warn(`[nelcota] ${source}: undecodable link path ${value}`, error);

    return null;
  }
}

const attr = (value: string): string => escapeHtml(value).replaceAll("'", '&#39;');
const stripInline = (text: string): string => text.replace(/[`*_]/g, '');

type LinkTarget = { readonly href: string; readonly external: boolean; readonly page?: string };

/** Repository-relative path of a GitHub URL for this repository, or null. */
function repoPathFromGithub(url: URL, source: string): string | null {
  if (!REPO_HOSTS.has(url.hostname)) return null;

  const decoded = safeDecode(url.pathname, source);
  if (decoded == null) return null;

  const path = decoded.replace(/^\//, '');
  const prefix = REPO_PREFIXES.find((candidate) => path.startsWith(candidate));
  if (prefix == null) return null;

  return path.slice(prefix.length).replace(/^(?:blob|tree)\/[^/]+\//, '');
}

function resolveLink(
  href: string,
  options: RenderOptions,
  links: InternalLink[],
): LinkTarget | null {
  if (href.startsWith('#')) return { href: attr(href), external: false };
  if (href.startsWith('mailto:')) return { href: attr(href), external: true };

  let url: URL;
  try {
    url = new URL(href, `${PLACEHOLDER_ORIGIN}/${options.source}`);
  } catch (error: unknown) {
    console.warn(`[nelcota] ${options.source}: invalid link ${href}`, error);

    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  const isRelative = url.origin === PLACEHOLDER_ORIGIN;
  const path = isRelative
    ? (safeDecode(url.pathname, options.source)?.replace(/^\//, '') ?? null)
    : repoPathFromGithub(url, options.source);
  if (path == null) return { href: attr(url.href), external: true };

  const anchor = url.hash.slice(1);
  const page =
    options.pageForSource(path) ?? options.pageForSource(`${path.replace(/\/$/, '')}/README.md`);
  if (page == null) return { href: attr(options.repoFileUrl(path, anchor)), external: true };

  links.push({ page, anchor });
  return { href: attr(options.pageUrl(page, anchor)), external: false, page };
}

const FILE_NAME = /^[\w./-]+\.md$/;

/** `[deploy.md](deploy.md)` reads as a file name; on the site it becomes the page title. */
function linkText(
  html: string,
  text: string,
  target: LinkTarget | null,
  options: RenderOptions,
): string {
  if (target?.page == null) return html;
  if (!FILE_NAME.test(text.replace(/`/g, ''))) return html;

  const title = options.pageTitle(target.page);
  if (title == null) return html;

  return escapeHtml(title);
}

function icon(spriteUrl: string, name: string, className: string): string {
  return `<svg aria-hidden="true" focusable="false" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="${className}"><use href="${attr(spriteUrl)}#icon-${name}"/></svg>`;
}

/** Plain text of a token, for search and descriptions (code included). */
function plainText(token: Token): string {
  if (token.type === 'code') return (token as Tokens.Code).text;
  if (token.type === 'table') {
    const table = token as Tokens.Table;
    return [...table.header, ...table.rows.flat()]
      .map((cell) => cell.tokens.map(plainText).join(''))
      .join(' ');
  }
  if (token.type === 'list') return (token as Tokens.List).items.map(plainText).join(' ');
  if ('tokens' in token && token.tokens != null && token.tokens.length > 0) {
    return token.tokens.map(plainText).join('');
  }
  if (token.type === 'space' || token.type === 'hr') return ' ';

  return 'text' in token ? token.text : '';
}

const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim();

/** Fallback anchor for a heading whose text has no letters or digits (emoji only). */
const EMPTY_SLUG = 'section';

/**
 * Index of the page title: the first H1, allowing blank lines and HTML comments
 * before it. -1 when the document does not open with one.
 */
function titleIndex(tokens: readonly Token[]): number {
  const index = tokens.findIndex((token) => token.type !== 'space' && token.type !== 'html');
  const first = tokens[index];
  if (first?.type !== 'heading') return -1;
  if ((first as Tokens.Heading).depth !== 1) return -1;

  return index;
}

/** The "# Title" a document opens with (same rule as the rendered page), or null. */
export function documentTitle(markdown: string): string | null {
  const tokens = new Marked({ gfm: true }).lexer(markdown);
  const token = tokens[titleIndex(tokens)];
  if (token == null) return null;

  return (token as Tokens.Heading).text.trim();
}

/**
 * Ids for every top-level heading, from the English text, before translation.
 * Unique even when a heading repeats or looks like a numbered one ("Setup",
 * "Setup", "Setup 1" → setup, setup-1, setup-1-1).
 */
function headingIds(tokens: readonly Token[], skip: number): Map<Tokens.Heading, string> {
  const used = new Set<string>();
  const ids = new Map<Tokens.Heading, string>();
  for (const [index, token] of tokens.entries()) {
    if (token.type !== 'heading') continue;
    if (index === skip) continue;

    const slug = headingSlug((token as Tokens.Heading).text);
    const base = slug.length === 0 ? EMPTY_SLUG : slug;
    let id = base;
    for (let n = 1; used.has(id); n += 1) id = `${base}-${n}`;

    used.add(id);
    ids.set(token as Tokens.Heading, id);
  }

  return ids;
}

/** Code in a language without a grammar: escaped, but split into lines like highlighted code. */
function plainLines(body: string): string {
  return body
    .split('\n')
    .map((line) => `<span class="ln">${escapeHtml(line)}</span>`)
    .join('\n');
}

async function highlightAll(
  marked: Marked,
  tokens: Token[],
  registry: HighlightRegistry,
): Promise<Map<Tokens.Code, string>> {
  const blocks: Tokens.Code[] = [];
  marked.walkTokens(tokens, (token) => {
    if (token.type === 'code') blocks.push(token as Tokens.Code);
  });

  const rendered = await Promise.all(
    blocks.map(async (block) => {
      const lang = LANGS[(block.lang ?? '').toLowerCase()];
      const body = block.text.trimEnd();
      if (lang == null) return plainLines(body);

      return registry.render(body, lang);
    }),
  );

  return new Map(blocks.map((block, index) => [block, rendered[index] ?? '']));
}

function firstLead(tokens: readonly Token[]): string {
  const paragraph = tokens.find((token) => token.type === 'paragraph');
  if (paragraph == null) return '';

  return collapse(stripInline(plainText(paragraph)));
}

function collectSections(tokens: readonly Token[], ids: Map<Tokens.Heading, string>): DocSection[] {
  const sections: DocSection[] = [];
  let current = { anchor: '', heading: '', parts: [] as string[] };
  const flush = (): void => {
    const text = collapse(current.parts.join(' ')).slice(0, MAX_SECTION_TEXT);
    if (text.length > 0 || current.heading.length > 0) {
      sections.push({ anchor: current.anchor, heading: current.heading, text });
    }
  };

  for (const token of tokens) {
    const id = token.type === 'heading' ? ids.get(token as Tokens.Heading) : undefined;
    if (id == null) {
      if (token.type !== 'heading') current.parts.push(plainText(token));
      continue;
    }
    flush();
    current = { anchor: id, heading: collapse(stripInline(plainText(token))), parts: [] };
  }
  flush();

  return sections;
}

/** Per-render state the renderer reads (ids, highlighted code) and fills (headings, links). */
interface RenderState {
  readonly ids: Map<Tokens.Heading, string>;
  readonly code: Map<Tokens.Code, string>;
  readonly headings: DocHeading[];
  readonly links: InternalLink[];
}

function useDocRenderer(marked: Marked, state: RenderState, options: RenderOptions): void {
  const { ids, code, headings, links } = state;
  const { labels, spriteUrl } = options;
  let codeIndex = 0;

  marked.use({
    renderer: {
      heading(token) {
        const inner = this.parser.parseInline(token.tokens);
        const id = ids.get(token);
        if (id == null) return `<p class="doc-subtitle">${inner}</p>`;

        const level = Math.max(MIN_HEADING_LEVEL, token.depth);
        const text = collapse(stripInline(plainText(token)));
        headings.push({ id, text, level });
        const label = attr(`${labels.sectionLink}: ${text}`);

        return `<h${level} id="${attr(id)}" class="doc-heading">${inner}<a class="doc-anchor" href="#${attr(id)}" aria-label="${label}"><span aria-hidden="true">#</span></a></h${level}>\n`;
      },
      code(token) {
        codeIndex += 1;
        const id = `code-${codeIndex}`;
        const lang = (token.lang ?? '').toLowerCase();
        const caption = CAPTIONS[lang] ?? (lang.length > 0 ? lang : 'text');
        const html = code.get(token) ?? escapeHtml(token.text);

        return `<figure class="doc-code"><figcaption id="${id}-caption">${escapeHtml(caption)}</figcaption><pre class="code-block" tabindex="0"><code id="${id}">${html}</code></pre><button type="button" class="doc-copy" data-copy="${id}" data-copied="${attr(labels.copied)}" data-failed="${attr(labels.copyFailed)}" aria-describedby="${id}-caption">${icon(spriteUrl, 'copy', 'copy-icon-idle')}${icon(spriteUrl, 'check', 'copy-icon-done')}<span data-copy-label>${escapeHtml(labels.copy)}</span></button></figure>\n`;
      },
      html(token) {
        return escapeHtml(token.text);
      },
      link(token) {
        const target = resolveLink(token.href, options, links);
        const text = linkText(this.parser.parseInline(token.tokens), token.text, target, options);
        if (target == null) return text;
        const rel = target.external ? ' rel="noopener"' : '';

        return `<a href="${target.href}"${rel}>${text}</a>`;
      },
      image(token) {
        return escapeHtml(token.text);
      },
      table(token) {
        const header = token.header.map((cell) => this.tablecell(cell)).join('');
        const rows = token.rows
          .map((row) => `<tr>${row.map((cell) => this.tablecell(cell)).join('')}</tr>`)
          .join('');

        return `<div class="doc-table" tabindex="0" role="region" aria-label="${attr(labels.table)}"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
      },
    },
  });
}

export async function renderDoc(markdown: string, options: RenderOptions): Promise<RenderedDoc> {
  const marked = new Marked({ gfm: true });
  const tokens = marked.lexer(markdown);
  const titleAt = titleIndex(tokens);
  const titleToken = tokens[titleAt];
  if (titleToken == null) {
    throw new MissingTitleError(`${options.source} has no "# Title" line at the top`);
  }

  const ids = headingIds(tokens, titleAt);
  const untranslated = options.catalog == null ? 0 : translateTokens(tokens, options.catalog);
  const code = await highlightAll(marked, tokens, options.registry);
  const links: InternalLink[] = [];
  const headings: DocHeading[] = [];
  useDocRenderer(marked, { ids, code, headings, links }, options);

  const title = collapse(stripInline(plainText(titleToken)));
  const body = tokens.filter((_, index) => index !== titleAt);
  const html = marked.parser(Object.assign(body, { links: tokens.links }));

  return {
    title,
    lead: firstLead(body),
    html,
    headings,
    sections: collectSections(body, ids),
    links,
    untranslated,
  };
}
