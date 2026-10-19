/**
 * Marks the header link of the section being read (aria-current="location"),
 * so the navbar doubles as a "you are here". A section counts as read while it
 * crosses the middle of the screen. Pages without those sections do nothing.
 */
const READING_BAND = '-45% 0px -50% 0px';

function sectionIdOf(link: HTMLAnchorElement): string | null {
  const hash = new URL(link.href).hash;
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
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        if (!entry.isIntersecting) visible.delete(entry.target.id);
      }
      // The first section in page order that is in the band wins.
      mark(sectionsInOrder.find((id) => visible.has(id)) ?? null);
    },
    { rootMargin: READING_BAND },
  );

  for (const section of sections) observer.observe(section);
}

setupScrollSpy();

// A module, so top-level names stay private to this file.
export {};
