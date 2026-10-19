/**
 * Docs search. Each [data-docs-search] box fetches the locale's static index
 * (src/lib/docs/search-index.ts) on first focus and filters it in the browser:
 * every word must appear in the page title, section heading or section text;
 * headings weigh most. Accents and case are ignored. Results form an ARIA
 * combobox list (arrows, Enter, Escape); "/" or Ctrl/⌘+K focuses the box.
 */
import {
  type Entry,
  parseIndex,
  queryTerms,
  SearchIndexError,
  type SearchResult,
  search,
} from './docs-search-index.ts';

const MIN_QUERY = 2;
/** A pasted essay should not rescan the whole index per word on every keystroke. */
const MAX_QUERY_CHARS = 100;
const SNIPPET_BEFORE = 50;
const SNIPPET_LENGTH = 150;
const LOAD_TIMEOUT_MS = 10_000;

const indexes = new Map<string, Promise<Entry[]>>();

function loadIndex(url: string): Promise<Entry[]> {
  const cached = indexes.get(url);
  if (cached != null) return cached;

  const loading = (async () => {
    const response = await fetch(url, { signal: AbortSignal.timeout(LOAD_TIMEOUT_MS) });
    if (!response.ok) throw new SearchIndexError(`Search index answered ${response.status}`);

    return parseIndex(await response.json());
  })();
  indexes.set(url, loading);
  // A failed load can be retried on the next focus.
  loading.catch(() => indexes.delete(url));

  return loading;
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
    // Warm the index so the first query answers at once; typing reports a failure in the panel.
    loadIndex(indexUrl).catch((error: unknown) => {
      console.warn('[nelcota] search index warm-up failed', error);
    });
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

/** The visible box: sidebar on wide screens, the one above the page on phones. */
const visibleInput = (): HTMLInputElement | undefined =>
  boxes
    .map((box) => box.querySelector<HTMLInputElement>('input[type="search"]'))
    .find(
      (candidate): candidate is HTMLInputElement =>
        candidate != null && candidate.offsetParent != null,
    );

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

document.addEventListener('keydown', (event) => {
  const isShortcut =
    (event.key === '/' && !isTyping(event.target)) ||
    (event.key === 'k' && (event.metaKey || event.ctrlKey));
  if (!isShortcut) return;

  const input = visibleInput();
  if (input == null) return;

  event.preventDefault();
  input.focus();
  input.select();
});

// Arriving from the header's "Search docs" (…/docs/#search): start typing right away.
if (window.location.hash === '#search') {
  visibleInput()?.focus();
}
