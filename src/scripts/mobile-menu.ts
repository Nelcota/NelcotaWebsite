/**
 * The phone menu is a native <details>. This adds what <details> lacks for a
 * menu: Escape closes it (focus back on the toggle), and so do a click outside
 * and following one of its links. Also keeps the #section when switching language.
 */
function setupMobileMenu(menu: HTMLDetailsElement): void {
  const toggle = menu.querySelector<HTMLElement>('summary');
  if (toggle == null) return;

  const close = (): void => {
    menu.open = false;
  };

  document.addEventListener('keydown', (event) => {
    if (!menu.open || event.key !== 'Escape') return;

    close();
    toggle.focus();
  });

  document.addEventListener('click', (event) => {
    if (!menu.open) return;

    if (event.target instanceof Node && menu.contains(event.target)) return;

    close();
  });

  for (const link of menu.querySelectorAll('a')) link.addEventListener('click', close);
}

for (const menu of document.querySelectorAll<HTMLDetailsElement>('[data-mobile-menu]')) {
  setupMobileMenu(menu);
}

// The language switch keeps the section the visitor is reading (/#faq → /pt-br/#faq).
for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-locale-switch]')) {
  link.addEventListener('click', () => {
    if (location.hash.length === 0) return;

    link.hash = location.hash;
  });
}

// A module, so top-level names stay private to this file.
export {};
