/**
 * Dark mode toggle. The pressed state (aria-pressed) mirrors whether the dark
 * theme is active, whether it came from the system or from a stored choice.
 */
type Theme = 'light' | 'dark';

const STORAGE_KEY = 'nelcota-theme';
const OPPOSITE: Readonly<Record<Theme, Theme>> = { light: 'dark', dark: 'light' };
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function currentTheme(): Theme {
  const stored = document.documentElement.dataset.theme;
  if (stored === 'light' || stored === 'dark') return stored;

  return prefersDark.matches ? 'dark' : 'light';
}

function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (error: unknown) {
    // Storage can be blocked (private mode, site data off): the choice still applies to this page.
    console.warn('[nelcota] theme preference not saved', error);
  }
}

function syncPressed(buttons: readonly HTMLButtonElement[]): void {
  const isDark = currentTheme() === 'dark';

  for (const button of buttons) button.setAttribute('aria-pressed', String(isDark));
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Cross-fades the theme change where the browser supports view transitions; switches instantly elsewhere. */
function applyTheme(theme: Theme, buttons: readonly HTMLButtonElement[]): void {
  const apply = (): void => {
    document.documentElement.dataset.theme = theme;
    syncPressed(buttons);
  };

  if (reducedMotion.matches || typeof document.startViewTransition !== 'function') {
    apply();
    return;
  }

  document.startViewTransition(apply);
}

const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')];

for (const button of buttons) {
  button.addEventListener('click', () => {
    const next = OPPOSITE[currentTheme()];

    applyTheme(next, buttons);
    saveTheme(next);
  });
}

prefersDark.addEventListener('change', () => syncPressed(buttons));
syncPressed(buttons);

// A module, so top-level names stay private to this file.
export {};
