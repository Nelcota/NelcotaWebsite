/**
 * The /docs area for one locale: every page of the manifest rendered from the
 * committed copy in vendor/nelcota-docs/ (see scripts/sync-docs.ts).
 * Rendered once per locale and build, then shared by every docs route.
 */
import { createHash } from 'node:crypto';
import lockJson from '../../../vendor/nelcota-docs/source.json';
import { bcp47, type Locale, t } from '../../i18n/utils.ts';
import { HighlightRegistry } from '../highlight.ts';
import { REPO_URL } from '../site.ts';
import { SPRITE_URL } from '../sprite.ts';
import { docsIndexUrl, docUrl } from './links.ts';
import { type DocsLock, lockSchema } from './lock.ts';
import { catalogPath, DOC_PAGES, type DocGroup, type DocPage, type DocPageId } from './manifest.ts';
import { documentTitle, type RenderedDoc, renderDoc } from './render.ts';
import { parseCatalog, type TranslationCatalog } from './translate.ts';

const VENDOR_PREFIX = '../../../vendor/nelcota-docs/';
const files = import.meta.glob<string>('../../../vendor/nelcota-docs/**/*.{md,json}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/**
 * How the page text relates to the locale: `source` (written in it),
 * `translated` / `partial` (from the repository's catalog), `english`
 * (no catalog yet) or `portuguese` (a Portuguese-only guide on the English site).
 */
export type DocStatus = 'source' | 'translated' | 'partial' | 'english' | 'portuguese';

export interface DocsPage extends RenderedDoc {
  readonly id: string;
  readonly group: DocGroup;
  readonly source: string;
  readonly url: string;
  readonly status: DocStatus;
  /** BCP 47 language of the page text (may differ from the site locale). */
  readonly lang: string;
  /** Short sidebar label and one-line summary, written in the site dictionaries. */
  readonly label: string;
  readonly summary: string;
  readonly readingMinutes: number;
}

export { docsIndexUrl, docUrl };

export interface DocsBundle {
  readonly pages: readonly DocsPage[];
  readonly lock: DocsLock;
  /** Highlight classes for every code block of the locale, and its CSP hash. */
  readonly css: string;
  readonly cssHash: `sha256-${string}`;
}

class MissingDocError extends Error {
  override readonly name = 'MissingDocError';
}

function readVendored(path: string): string {
  const text = files[`${VENDOR_PREFIX}${path}`];
  if (text == null)
    throw new MissingDocError(`${path} is not in vendor/nelcota-docs/ (run pnpm docs:sync)`);

  return text;
}

const PAGES = DOC_PAGES as readonly DocPage[];
const bySource = new Map(PAGES.map((page) => [page.source, page.id]));

/** A repository file that is not published under /docs: link to it on GitHub. */
function repoFileUrl(path: string, anchor: string): string {
  const kind = path.length === 0 || path.endsWith('/') ? 'tree' : 'blob';
  const hash = anchor.length === 0 ? '' : `#${anchor}`;

  return `${REPO_URL}/${kind}/main/${path}${hash}`;
}

export function editUrl(source: string): string {
  return `${REPO_URL}/blob/main/${source}`;
}

function catalogFor(page: DocPage, locale: Locale): TranslationCatalog | undefined {
  if (locale !== 'pt-br' || page.catalog == null) return undefined;

  const path = catalogPath(page.catalog);
  return parseCatalog(readVendored(path), path);
}

function statusOf(page: DocPage, locale: Locale, untranslated: number): DocStatus {
  if (page.language != null) return locale === 'pt-br' ? 'source' : 'portuguese';
  if (locale === 'en') return 'source';
  if (page.catalog == null) return 'english';

  return untranslated === 0 ? 'translated' : 'partial';
}

const LANG_OF_STATUS: Readonly<Record<DocStatus, string | null>> = {
  source: null,
  translated: null,
  partial: null,
  english: 'en',
  portuguese: 'pt-BR',
};

/** Page titles come first so links written as file names can show them. */
function pageTitles(locale: Locale): Map<string, string> {
  const titles = new Map<string, string>();
  for (const page of PAGES) {
    // Same rule as the page itself, so a "# comment" inside a code block is never taken as the title.
    const heading = documentTitle(readVendored(page.source));
    if (heading == null) continue;

    const translated = catalogFor(page, locale)?.[heading] ?? heading;
    titles.set(page.id, translated.replace(/[`*_]/g, ''));
  }

  return titles;
}

/** Links to a section that does not exist are reported at build time, not shipped silently. */
function reportBrokenAnchors(pages: readonly DocsPage[]): void {
  const anchors = new Map(pages.map((page) => [page.id, new Set(page.headings.map((h) => h.id))]));
  const broken = new Set<string>();
  for (const page of pages) {
    for (const link of page.links) {
      if (link.anchor.length === 0) continue;
      if (anchors.get(link.page)?.has(link.anchor) === true) continue;

      broken.add(`${page.source} → ${link.page}#${link.anchor}`);
    }
  }
  if (broken.size === 0) return;

  console.warn(`[nelcota] docs links to missing sections:\n  ${[...broken].join('\n  ')}`);
}

async function buildDocs(locale: Locale): Promise<DocsBundle> {
  const dict = t(locale);
  const registry = new HighlightRegistry();
  const titles = pageTitles(locale);

  const pages = await Promise.all(
    PAGES.map(async (page): Promise<DocsPage> => {
      const rendered = await renderDoc(readVendored(page.source), {
        source: page.source,
        catalog: catalogFor(page, locale),
        registry,
        pageForSource: (path) => bySource.get(path),
        pageUrl: (id, anchor) => docUrl(locale, id, anchor),
        pageTitle: (id) => titles.get(id),
        repoFileUrl,
        spriteUrl: SPRITE_URL,
        labels: {
          copy: dict.code.copy,
          copied: dict.code.copied,
          copyFailed: dict.code.copyFailed,
          sectionLink: dict.docsSite.sectionLink,
          table: dict.docsSite.table,
        },
      });
      const status = statusOf(page, locale, rendered.untranslated);

      return {
        ...rendered,
        id: page.id,
        group: page.group,
        source: page.source,
        url: docUrl(locale, page.id),
        status,
        lang: LANG_OF_STATUS[status] ?? bcp47[locale],
        label: dict.docsSite.pages[page.id as DocPageId].label,
        summary: dict.docsSite.pages[page.id as DocPageId].summary,
        readingMinutes: readingMinutes(rendered.html),
      };
    }),
  );
  if (locale === 'en') reportBrokenAnchors(pages);

  const css = registry.css();
  const cssHash = `sha256-${createHash('sha256').update(css).digest('base64')}` as const;

  return { pages, lock: lockSchema.parse(lockJson), css, cssHash };
}

const WORDS_PER_MINUTE = 220;

/** Prose only: code blocks (with their caption and copy button) and heading anchors are not read. */
function readingMinutes(html: string): number {
  const words = html
    .replace(/<figure class="doc-code">[\s\S]*?<\/figure>/g, ' ')
    .replace(/<a class="doc-anchor"[\s\S]*?<\/a>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[#\w]+;/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0);

  return Math.max(1, Math.round(words.length / WORDS_PER_MINUTE));
}

const cache = new Map<Locale, Promise<DocsBundle>>();

export function loadDocs(locale: Locale): Promise<DocsBundle> {
  const cached = cache.get(locale);
  if (cached != null) return cached;

  const bundle = buildDocs(locale);
  cache.set(locale, bundle);

  return bundle;
}

export function findDoc(bundle: DocsBundle, id: string): DocsPage {
  const page = bundle.pages.find((candidate) => candidate.id === id);
  if (page == null) throw new MissingDocError(`No docs page "${id}"`);

  return page;
}
