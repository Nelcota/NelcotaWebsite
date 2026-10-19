/**
 * The pure half of the docs search (./docs-search.ts): validating the static
 * index (src/lib/docs/search-index.ts), folding text for accent- and
 * case-insensitive matching, and ranking sections against a query. No DOM, so
 * it runs under `node --test`.
 */
type Section = readonly [anchor: string, heading: string, text: string];
type Page = readonly [title: string, url: string, sections: readonly Section[]];

export interface Entry {
  readonly title: string;
  readonly heading: string;
  readonly text: string;
  readonly url: string;
  readonly folded: { readonly title: string; readonly heading: string; readonly text: string };
}

export interface SearchResult {
  readonly shown: readonly Entry[];
  /** Every match, including the ones past MAX_RESULTS. */
  readonly total: number;
}

/** The index could not be fetched or is not in the expected shape. */
export class SearchIndexError extends Error {
  override readonly name = 'SearchIndexError';
}

const MAX_RESULTS = 8;
const MAX_TERMS = 8;
const NON_ASCII = /[^\p{ASCII}]/u;
const COMBINING_MARKS = /\p{M}/gu;
const WEIGHT = { heading: 8, title: 4, text: 1, phrase: 6 } as const;

/** Lowercase without accents, keeping one character per input character so offsets match. */
export function fold(text: string): string {
  // Fast path: plain ASCII has no accents to strip (most of the index).
  if (!NON_ASCII.test(text)) return text.toLowerCase();

  let folded = '';
  for (const char of text) {
    const base = char.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
    folded += base.length === char.length ? base : char;
  }

  return folded;
}

function isPage(value: unknown): value is Page {
  return (
    Array.isArray(value) &&
    typeof value[0] === 'string' &&
    typeof value[1] === 'string' &&
    Array.isArray(value[2])
  );
}

function toEntries(pages: readonly Page[]): Entry[] {
  return pages.flatMap(([title, url, sections]) =>
    sections.map(([anchor, heading, text]) => ({
      title,
      heading,
      text,
      url: anchor.length === 0 ? url : `${url}#${anchor}`,
      folded: { title: fold(title), heading: fold(heading), text: fold(text) },
    })),
  );
}

/** Searchable entries from the parsed index JSON; anything else is a SearchIndexError. */
export function parseIndex(data: unknown): Entry[] {
  if (!Array.isArray(data) || !data.every(isPage)) {
    throw new SearchIndexError('Unexpected search index');
  }

  return toEntries(data);
}

function score(entry: Entry, terms: readonly string[], phrase: string): number {
  let total = 0;
  for (const term of terms) {
    const inHeading = entry.folded.heading.includes(term);
    const inTitle = entry.folded.title.includes(term);
    const inText = entry.folded.text.includes(term);
    if (!inHeading && !inTitle && !inText) return 0;

    total +=
      (inHeading ? WEIGHT.heading : 0) + (inTitle ? WEIGHT.title : 0) + (inText ? WEIGHT.text : 0);
  }
  if (terms.length > 1 && entry.folded.heading.includes(phrase)) total += WEIGHT.phrase;
  if (terms.length > 1 && entry.folded.text.includes(phrase)) total += WEIGHT.phrase / 2;

  return total;
}

export function queryTerms(query: string): string[] {
  return fold(query)
    .split(/\s+/)
    .filter((term) => term.length > 0)
    .slice(0, MAX_TERMS);
}

/** Entries holding every term, best first; equal scores keep index order. */
export function search(entries: readonly Entry[], query: string): SearchResult {
  const phrase = fold(query);
  const terms = queryTerms(query);
  if (terms.length === 0) return { shown: [], total: 0 };

  const matches = entries
    .map((entry, order) => ({ entry, order, points: score(entry, terms, phrase) }))
    .filter((match) => match.points > 0)
    .toSorted((a, b) => (a.points === b.points ? a.order - b.order : b.points - a.points));

  return {
    shown: matches.slice(0, MAX_RESULTS).map((match) => match.entry),
    total: matches.length,
  };
}
