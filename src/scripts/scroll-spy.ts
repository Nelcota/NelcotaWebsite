/**
 * Marks the header link of the section being read (aria-current="location"),
 * so the navbar doubles as a "you are here". A section counts as read while it
 * crosses the middle of the screen. Pages without those sections do nothing.
 */
const READING_BAND = '-45% 0px -50% 0px';
/** Without scrollend: quiet time after the last scroll event before the spy takes over again. */
const SCROLL_SETTLE_MS = 150;
/** Safety net: the longest a click keeps the dot on its target without the scroll ending. */
const CLICK_LOCK_MAX_MS = 2000;
const SUPPORTS_SCROLL_END = 'onscrollend' in window;

function sectionIdOf(link: HTMLAnchorElement): string | null {
  const url = new URL(link.href);
  if (
    url.origin !== location.origin ||
    url.pathname !== location.pathname ||
    url.search !== location.search
  )
    return null;

  const hash = url.hash;
  if (hash.length <= 1) return null;

  return hash.slice(1);
}

/** A [data-spy-sections="a b"] control (the Product menu) stands for several sections. */
function groupIdsOf(element: HTMLElement): readonly string[] {
  return (element.dataset.spySections ?? '').split(' ').filter((id) => id.length > 0);
}

function setupScrollSpy(): void {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('a[data-spy]')];
  const groups = [...document.querySelectorAll<HTMLElement>('[data-spy-sections]')];
  const ids = [
    ...new Set([
      ...links.map(sectionIdOf).filter((id): id is string => id != null),
      ...groups.flatMap(groupIdsOf),
    ]),
  ];
  const sections = ids
    .map((id) => document.getElementById(id))
    .filter((section): section is HTMLElement => section != null);
  if (sections.length === 0) return;

  const sectionsInOrder = sections
    .toSorted((a, b) =>
      (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0 ? -1 : 1,
    )
    .map((section) => section.id);

  const mark = (id: string | null): void => {
    for (const link of links) {
      if (link.getAttribute('aria-current') === 'page') continue;

      if (id != null && sectionIdOf(link) === id) link.setAttribute('aria-current', 'location');
      if (id == null || sectionIdOf(link) !== id) link.removeAttribute('aria-current');
    }

    for (const group of groups) {
      const isReading = id != null && groupIdsOf(group).includes(id);
      if (isReading) group.setAttribute('aria-current', 'location');
      if (!isReading) group.removeAttribute('aria-current');
    }
  };

  const visible = new Set<string>();
  // The first section in page order that is in the band wins.
  const readingSectionId = (): string | null =>
    sectionsInOrder.find((id) => visible.has(id)) ?? null;
  const markReading = (): void => mark(readingSectionId());

  // After a click the dot goes straight to the target; the sections the smooth
  // scroll passes over must not take it on the way.
  let isFollowingClick = false;
  let releaseTimer: number | undefined;
  let safetyTimer: number | undefined;
  const releaseClickLock = (): void => {
    window.clearTimeout(releaseTimer);
    window.clearTimeout(safetyTimer);
    isFollowingClick = false;
    markReading();
  };
  const releaseAfter = (delayMs: number): void => {
    window.clearTimeout(releaseTimer);
    releaseTimer = window.setTimeout(releaseClickLock, delayMs);
  };

  const releaseOnEvent = (): void => {
    if (!isFollowingClick) return;

    releaseClickLock();
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!isFollowingClick) return;

      // Without scrollend, the scroll is over once its events stop.
      if (!SUPPORTS_SCROLL_END) releaseAfter(SCROLL_SETTLE_MS);
    },
    { passive: true },
  );
  window.addEventListener('scrollend', releaseOnEvent);
  // The reader takes over the scroll: the spy follows them again.
  for (const type of ['wheel', 'touchstart']) {
    window.addEventListener(type, releaseOnEvent, { passive: true });
  }

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key))
      releaseOnEvent();
  });

  for (const link of links) {
    link.addEventListener('click', (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.hasAttribute('download') ||
        (link.target && link.target !== '_self')
      )
        return;
      const id = sectionIdOf(link);
      // Only sections on this page: a link to another page must not lock the dot.
      if (id == null || !sectionsInOrder.includes(id)) return;

      isFollowingClick = true;
      mark(id);
      window.clearTimeout(releaseTimer);
      window.clearTimeout(safetyTimer);
      safetyTimer = window.setTimeout(releaseClickLock, CLICK_LOCK_MAX_MS);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        if (!entry.isIntersecting) visible.delete(entry.target.id);
      }
      if (isFollowingClick) return;

      markReading();
    },
    { rootMargin: READING_BAND },
  );

  for (const section of sections) observer.observe(section);
}

setupScrollSpy();

// A module, so top-level names stay private to this file.
export {};
