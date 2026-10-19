/**
 * Horizontal carousels: a scroll-snap track ([data-carousel-track]) with
 * previous/next buttons and a progress bar. The track scrolls natively (touch,
 * trackpad, keyboard); the buttons move one slide and turn themselves off at
 * the ends; the bar follows the scroll position. Without JS the track still
 * scrolls.
 */
/** Sub-pixel widths never reach the exact end of the track. */
const END_TOLERANCE_PX = 1;

function setupCarousel(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>('[data-carousel-track]');
  if (track == null) return;

  const prev = root.querySelector<HTMLButtonElement>('[data-carousel-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
  const bar = root.querySelector<HTMLElement>('[data-carousel-bar]');

  const slideWidth = (): number =>
    track.firstElementChild?.getBoundingClientRect().width ?? track.clientWidth;

  const sync = (): void => {
    const max = track.scrollWidth - track.clientWidth;
    const progress = max > 0 ? track.scrollLeft / max : 1;
    prev?.toggleAttribute('disabled', track.scrollLeft <= END_TOLERANCE_PX);
    next?.toggleAttribute('disabled', track.scrollLeft >= max - END_TOLERANCE_PX);
    bar?.style.setProperty('--progress', String(Math.min(1, Math.max(0, progress))));
  };

  prev?.addEventListener('click', () =>
    track.scrollBy({ left: -slideWidth(), behavior: 'smooth' }),
  );
  next?.addEventListener('click', () => track.scrollBy({ left: slideWidth(), behavior: 'smooth' }));
  track.addEventListener('scroll', sync, { passive: true });
  // Resize observers fire right after layout (including once on observe), so
  // measuring there never forces an extra layout during page load.
  new ResizeObserver(sync).observe(track);
}

for (const root of document.querySelectorAll<HTMLElement>('[data-carousel]')) {
  setupCarousel(root);
}

// A module, so top-level names stay private to this file.
export {};
