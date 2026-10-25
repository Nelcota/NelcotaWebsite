/**
 * Loads the scroll animations (GSAP + ScrollTrigger, ./index.ts) only once the
 * visitor starts to interact, so nothing competes with the first paint and the
 * page is complete and readable before any of it runs. With reduced motion it
 * never loads. Everything it animates is visible in the HTML.
 *
 * Plain `scroll` events also come from the browser itself (an #anchor in the
 * address, a restored position): measuring the layout in the middle of that
 * smooth scroll would stop it halfway, so for those we wait until the
 * scrolling has settled.
 */
const INTENT_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
const SCROLL_SETTLE_MS = 250;

function startOnFirstInteraction(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let hasStarted = false;
  let settleTimer = 0;

  const start = (): void => {
    if (hasStarted) return;
    hasStarted = true;

    firstLayout.disconnect();
    window.clearTimeout(settleTimer);
    for (const type of INTENT_EVENTS) window.removeEventListener(type, start);
    window.removeEventListener('scroll', startWhenSettled);
    import('./index.ts').catch((error: unknown) => {
      // The page works without the animations: report and carry on.
      console.warn('[nelcota] scroll animations did not load', error);
    });
  };

  const startWhenSettled = (): void => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(start, SCROLL_SETTLE_MS);
  };

  // Reading scrollY during module evaluation can force the first page layout.
  // ResizeObserver runs after layout, including for a restored scroll position.
  const firstLayout = new ResizeObserver(() => {
    firstLayout.disconnect();
    if (!hasStarted && window.scrollY > 0) startWhenSettled();
  });

  for (const type of INTENT_EVENTS) window.addEventListener(type, start, { passive: true });
  window.addEventListener('scroll', startWhenSettled, { passive: true });

  firstLayout.observe(document.documentElement);
}

startOnFirstInteraction();

// A module, so top-level names stay private to this file.
export {};
