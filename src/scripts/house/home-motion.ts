/** Shared helpers for the home scripts. */

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Smooth scrolling, unless the visitor asked for less motion. */
export function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

/** Header height, read from --h-nav-h so the scripts and the CSS agree. */
export function navHeight(): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--h-nav-h');
  const height = Number.parseFloat(value);
  if (Number.isNaN(height)) return 0;

  return height;
}
