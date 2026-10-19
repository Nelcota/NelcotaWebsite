/**
 * WAI-ARIA tabs for every `[data-tabs]` root on the page: click to select,
 * Arrow keys / Home / End move focus and selection.
 */
type Move = (index: number, count: number) => number;

const KEY_MOVES: Readonly<Record<string, Move>> = {
  ArrowRight: (index, count) => (index + 1) % count,
  ArrowLeft: (index, count) => (index - 1 + count) % count,
  ArrowDown: (index, count) => (index + 1) % count,
  ArrowUp: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_index, count) => count - 1,
};

interface Tab {
  readonly button: HTMLButtonElement;
  readonly panel: HTMLElement;
}

function findTabs(root: HTMLElement): readonly Tab[] {
  // Only this root's own tabs: a tab group may sit inside another one's panel.
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')].filter(
    (button) => button.closest('[data-tabs]') === root,
  );

  return buttons.flatMap((button) => {
    const panelId = button.getAttribute('aria-controls');
    if (panelId == null) return [];

    const panel = document.getElementById(panelId);
    if (panel == null) return [];

    return [{ button, panel }];
  });
}

function selectTab(tabs: readonly Tab[], selected: number, shouldFocus: boolean): void {
  for (const [index, { button, panel }] of tabs.entries()) {
    const isActive = index === selected;

    button.setAttribute('aria-selected', String(isActive));
    button.tabIndex = isActive ? 0 : -1;
    panel.hidden = !isActive;

    if (isActive && shouldFocus) button.focus();
  }
}

function setupTabs(root: HTMLElement): void {
  const tabs = findTabs(root);
  if (tabs.length === 0) return;

  for (const [index, { button }] of tabs.entries()) {
    button.addEventListener('click', () => selectTab(tabs, index, false));

    button.addEventListener('keydown', (event) => {
      const move = KEY_MOVES[event.key];
      if (move == null) return;

      event.preventDefault();
      selectTab(tabs, move(index, tabs.length), true);
    });
  }
}

for (const root of document.querySelectorAll<HTMLElement>('[data-tabs]')) {
  setupTabs(root);
}

/**
 * A [data-select-tab="<tab id>"] button (e.g. "Next step") picks that tab and
 * moves focus to it, so keyboard users land on the newly shown content.
 */
document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;

  const trigger = event.target.closest<HTMLElement>('[data-select-tab]');
  const tabId = trigger?.dataset.selectTab;
  if (tabId == null) return;

  const tab = document.getElementById(tabId);
  if (tab == null) return;

  tab.click();
  tab.focus({ preventScroll: true });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  tab.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
});

// A module, so top-level names stay private to this file.
export {};
