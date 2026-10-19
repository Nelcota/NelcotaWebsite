/**
 * The pause button of the closing section's drifting tiles. Pressing it stops
 * every drifting row on the page (CSS reads [data-motion-paused] on <html>),
 * so moving content that starts by itself can always be stopped (WCAG 2.2.2).
 */
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-motion-pause]')) {
  button.addEventListener('click', () => {
    const isPaused = button.getAttribute('aria-pressed') !== 'true';

    button.setAttribute('aria-pressed', String(isPaused));
    document.documentElement.toggleAttribute('data-motion-paused', isPaused);
  });
}

// A module, so top-level names stay private to this file.
export {};
