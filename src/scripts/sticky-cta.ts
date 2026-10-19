/**
 * Shows the phone "Get started" pill only when it adds something: not over the
 * hero (which has its own buttons), not over the quickstart it links to and
 * not over the closing call to action or the footer. Hidden, it is inert (no
 * focus, no clicks).
 */
function setupStickyCta(cta: HTMLElement): void {
  const blockers = [...document.querySelectorAll<HTMLElement>('[data-hides-sticky-cta]')];
  if (blockers.length === 0) return;

  const onScreen = new Set<Element>();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) onScreen.add(entry.target);
      if (!entry.isIntersecting) onScreen.delete(entry.target);
    }

    const isShown = onScreen.size === 0;
    cta.toggleAttribute('data-shown', isShown);
    cta.inert = !isShown;
  });

  for (const blocker of blockers) observer.observe(blocker);
}

const cta = document.querySelector<HTMLElement>('[data-sticky-cta]');
if (cta != null) setupStickyCta(cta);

// A module, so top-level names stay private to this file.
export {};
