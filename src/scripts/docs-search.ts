/**
 * Docs search. Each [data-docs-search] box fetches the locale's static index
 * (src/lib/docs/search-index.ts) on first focus and filters it in the browser:
 * every word must appear in the page title, section heading or section text;
 * headings weigh most. Accents and case are ignored. Results form an ARIA
 * combobox list (arrows, Enter, Escape); "/" or Ctrl/⌘+K focuses the box.
 */
type Section = readonly [anchor: string, heading: string, text: string];
type Page = readonly [title: string, url: string, sections: readonly Section[]];

interface Entry {
  readonly title: string;
  readonly heading: string;
  readonly text: string;
  readonly url: string;
  readonly folded: { readonly title: string; readonly heading: string; readonly text: string };
}

const MAX_RESULTS = 8;
const MIN_QUERY = 2;
/** A pasted essay should not rescan the whole index per word on every keystroke. */
const MAX_QUERY_CHARS = 100;
const MAX_TERMS = 8;
const NON_ASCII = /[^\p{ASCII}]/u;
const SNIPPET_BEFORE = 50;
const SNIPPET_LENGTH = 150;
const LOAD_TIMEOUT_MS = 10_000;
const WEIGHT = { heading: 8, title: 4, text: 1, phrase: 6 } as const;

const COMBINING_MARKS = /\p{M}/gu;

/** Lowercase without accents, keeping one character per input character so offsets match. */
function fold(text: string): string {
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

const indexes = new Map<string, Promise<Entry[]>>();

function loadIndex(url: string): Promise<Entry[]> {
  const cached = indexes.get(url);
  if (cached != null) return cached;

  const loading = (async () => {
    const response = await fetch(url, { signal: AbortSignal.timeout(LOAD_TIMEOUT_MS) });
    if (!response.ok) throw new Error(`Search index answered ${response.status}`);

    const data: unknown = await response.json();
    if (!Array.isArray(data) || !data.every(isPage)) throw new TypeError('Unexpected search index');

    return toEntries(data);
  })();
  indexes.set(url, loading);
  // A failed load can be retried on the next focus.
  loading.catch(() => indexes.delete(url));

  return loading;
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

function queryTerms(query: string): string[] {
  return fold(query)
    .split(/\s+/)
    .filter((term) => term.length > 0)
    .slice(0, MAX_TERMS);
}

interface SearchResult {
  readonly shown: readonly Entry[];
  /** Every match, including the ones past MAX_RESULTS. */
  readonly total: number;
}

function search(entries: readonly Entry[], query: string): SearchResult {
  const phrase = fold(query);
  const terms = queryTerms(query);
  if (terms.length === 0) return { shown: [], total: 0 };

  const matches = entries
    .map((entry, order) => ({ entry, order, points: score(entry, terms, phrase) }))
    .filter((match) => match.points > 0)
    .toSorted((a, b) => b.points - a.points || a.order - b.order);

  return {
    shown: matches.slice(0, MAX_RESULTS).map((match) => match.entry),
    total: matches.length,
  };
}

/** A text excerpt around the first matching word, with every match in <mark>. */
function snippet(entry: Entry, terms: readonly string[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const positions = terms.map((term) => entry.folded.text.indexOf(term)).filter((at) => at >= 0);
  const first = positions.length === 0 ? 0 : Math.min(...positions);
  const start = Math.max(0, first - SNIPPET_BEFORE);
  const end = Math.min(entry.text.length, start + SNIPPET_LENGTH);
  const text = entry.text.slice(start, end);
  const folded = entry.folded.text.slice(start, end);
  const pattern = new RegExp(
    terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
    'g',
  );

  let cursor = 0;
  for (const match of folded.matchAll(pattern)) {
    fragment.append(text.slice(cursor, match.index));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(match.index, match.index + match[0].length);
    fragment.append(mark);
    cursor = match.index + match[0].length;
  }
  fragment.append(text.slice(cursor));
  if (start > 0) fragment.prepend('…');
  if (end < entry.text.length) fragment.append('…');

  return fragment;
}

function resultItem(entry: Entry, terms: readonly string[], id: string): HTMLDivElement {
  const item = document.createElement('div');
  item.id = id;
  item.setAttribute('role', 'option');
  item.setAttribute('aria-selected', 'false');

  const link = document.createElement('a');
  link.href = entry.url;
  link.tabIndex = -1;
  link.className = 'docs-search-result';

  const where = document.createElement('span');
  where.className = 'docs-search-where';
  where.textContent = entry.heading.length > 0 ? `${entry.title} › ${entry.heading}` : entry.title;
  link.append(where);

  if (entry.text.length > 0) {
    const excerpt = document.createElement('span');
    excerpt.className = 'docs-search-excerpt';
    excerpt.append(snippet(entry, terms));
    link.append(excerpt);
  }
  item.append(link);

  return item;
}

function setupSearch(root: HTMLElement): void {
  const input = root.querySelector<HTMLInputElement>('input[type="search"]');
  const panel = root.querySelector<HTMLElement>('[data-search-panel]');
  const status = root.querySelector<HTMLElement>('[data-search-status]');
  const list = root.querySelector<HTMLDivElement>('[role="listbox"]');
  const indexUrl = root.dataset.index;
  if (input == null || panel == null || status == null || list == null || indexUrl == null) return;

  const text = {
    loading: root.dataset.loading ?? '',
    empty: root.dataset.empty ?? '',
    failed: root.dataset.failed ?? '',
    results: root.dataset.results ?? '{count}',
    resultOne: root.dataset.resultOne ?? '1',
    resultsShown: root.dataset.resultsShown ?? '{shown}/{count}',
  };

  const summary = ({ shown, total }: SearchResult): string => {
    if (total === 0) return text.empty;
    if (total === 1) return text.resultOne;
    if (total > shown.length)
      return text.resultsShown
        .replace('{shown}', String(shown.length))
        .replace('{count}', String(total));

    return text.results.replace('{count}', String(total));
  };
  let active = -1;
  let runId = 0;

  const options = (): HTMLDivElement[] => [
    ...list.querySelectorAll<HTMLDivElement>('[role="option"]'),
  ];

  const setOpen = (open: boolean): void => {
    panel.hidden = !open;
    input.setAttribute('aria-expanded', String(open));
    if (open) return;

    active = -1;
    input.removeAttribute('aria-activedescendant');
  };

  const setActive = (next: number): void => {
    const items = options();
    if (items.length === 0) return;

    // ArrowUp with nothing selected goes to the last result, like any listbox.
    const count = items.length;
    active = active < 0 && next < 0 ? count - 1 : ((next % count) + count) % count;
    for (const [index, item] of items.entries())
      item.setAttribute('aria-selected', String(index === active));
    const current = items[active];
    if (current == null) return;

    input.setAttribute('aria-activedescendant', current.id);
    current.scrollIntoView({ block: 'nearest' });
  };

  const run = async (): Promise<void> => {
    const query = input.value.trim().slice(0, MAX_QUERY_CHARS);
    runId += 1;
    const id = runId;
    if (query.length < MIN_QUERY) {
      setOpen(false);
      return;
    }

    setOpen(true);
    let entries: Entry[];
    try {
      if (!indexes.has(indexUrl)) status.textContent = text.loading;
      entries = await loadIndex(indexUrl);
    } catch (error: unknown) {
      console.warn('[nelcota] search index failed', error);
      status.textContent = text.failed;
      list.replaceChildren();
      return;
    }
    if (id !== runId) return;

    const terms = queryTerms(query);
    const results = search(entries, query);
    list.replaceChildren(
      ...results.shown.map((entry, index) => resultItem(entry, terms, `${list.id}-${index}`)),
    );
    status.textContent = summary(results);
    active = -1;
    input.removeAttribute('aria-activedescendant');
  };

  input.addEventListener('focus', () => {
    // Warm the index so the first query answers at once; errors surface on typing.
    loadIndex(indexUrl).catch(() => undefined);
    if (input.value.trim().length >= MIN_QUERY) setOpen(true);
  });
  input.addEventListener('input', () => {
    void run();
  });

  const KEYS: Readonly<Record<string, () => void>> = {
    ArrowDown: () => setActive(active + 1),
    ArrowUp: () => setActive(active - 1),
    Enter: () => options()[active]?.querySelector('a')?.click(),
    Escape: () => {
      if (panel.hidden) input.value = '';
      setOpen(false);
    },
  };
  input.addEventListener('keydown', (event) => {
    const action = KEYS[event.key];
    if (action == null) return;
    if (event.key === 'Enter' && active < 0) return;

    event.preventDefault();
    action();
  });

  root.addEventListener('focusout', (event) => {
    if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return;

    setOpen(false);
  });
  // Keep focus on the box while a result is pressed, so the list does not close first.
  list.addEventListener('mousedown', (event) => event.preventDefault());
}

const boxes = [...document.querySelectorAll<HTMLElement>('[data-docs-search]')];
for (const box of boxes) setupSearch(box);

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

document.addEventListener('keydown', (event) => {
  const isShortcut =
    (event.key === '/' && !isTyping(event.target)) ||
    (event.key === 'k' && (event.metaKey || event.ctrlKey));
  if (!isShortcut) return;

  // The visible box: sidebar on wide screens, the one above the page on phones.
  const input = boxes
    .map((box) => box.querySelector<HTMLInputElement>('input[type="search"]'))
    .find((candidate) => candidate != null && candidate.offsetParent != null);
  if (input == null) return;

  event.preventDefault();
  input.focus();
  input.select();
});

// Arriving from the header's "Search docs" (…/docs/#search): start typing right away.
if (window.location.hash === '#search') {
  const input = boxes
    .map((box) => box.querySelector<HTMLInputElement>('input[type="search"]'))
    .find((candidate) => candidate != null && candidate.offsetParent != null);
  input?.focus();
}

// A module, so top-level names stay private to this file.
export {};
