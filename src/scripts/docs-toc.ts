/**
 * Marks the "on this page" entry of the section being read with
 * aria-current="true" (desktop column and phone menu share the markup).
 * The current section is the last heading that has scrolled past the top
 * band of the viewport: where a clicked anchor lands (scroll-padding of the
 * page plus the heading's scroll-margin), plus a little slack.
 */
const BAND_SLACK_PX = 8;

const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc] a[href^="#"]')];
const ids = [...new Set(links.map((link) => decodeURIComponent(link.hash.slice(1))))];
const headings = ids
  .map((id) => document.getElementById(id))
  .filter((heading): heading is HTMLElement => heading != null);

let current = '';
let frame = 0;

const px = (value: string): number => {
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

/** Read once: it changes only with the breakpoint, and reading it per frame would force style recalcs. */
function topBand(): number {
  const pagePadding = px(getComputedStyle(document.documentElement).scrollPaddingTop);
  const first = headings[0];
  const headingMargin = first == null ? 0 : px(getComputedStyle(first).scrollMarginTop);

  return pagePadding + headingMargin + BAND_SLACK_PX;
}

let band: number | undefined;

function update(): void {
  frame = 0;
  if (band === undefined) return;
  let active = headings[0]?.id ?? '';
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top > band) break;

    active = heading.id;
  }
  if (active === current) return;

  current = active;
  for (const link of links) {
    const isCurrent = decodeURIComponent(link.hash.slice(1)) === active;
    if (isCurrent) link.setAttribute('aria-current', 'true');
    if (!isCurrent) link.removeAttribute('aria-current');
  }
}

if (headings.length > 0) {
  window.addEventListener(
    'scroll',
    () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    },
    { passive: true },
  );
  // Initial geometry and breakpoint changes are read after layout, rather
  // than forcing it while the document's modules are still initializing.
  const geometry = new ResizeObserver(() => {
    band = topBand();
    if (frame !== 0) window.cancelAnimationFrame(frame);
    update();
  });
  geometry.observe(document.documentElement);
}

// A module, so top-level names stay private to this file.
export {};
