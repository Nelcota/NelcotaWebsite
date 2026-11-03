/**
 * "Mostrar as N versões" on /transparencia ([data-releases]). The HTML lists
 * every release so it works without JavaScript; this hides the older ones and
 * reveals the toggle.
 */
interface ReleasesToggle {
  readonly button: HTMLButtonElement;
  readonly extras: readonly HTMLElement[];
  readonly labelMore: string;
  readonly labelLess: string;
}

function findReleasesToggle(root: HTMLElement): ReleasesToggle | null {
  const button = root.querySelector<HTMLButtonElement>('[data-releases-toggle]');
  if (button == null) return null;

  const extras = [...root.querySelectorAll<HTMLElement>('[data-release-extra]')];
  if (extras.length === 0) return null;

  const labelMore = button.dataset.labelMore ?? '';
  const labelLess = button.dataset.labelLess ?? '';
  if (labelMore === '' || labelLess === '') return null;

  return { button, extras, labelMore, labelLess };
}

function setExpanded(toggle: ReleasesToggle, isExpanded: boolean): void {
  for (const item of toggle.extras) item.hidden = !isExpanded;
  toggle.button.setAttribute('aria-expanded', String(isExpanded));
  toggle.button.textContent = isExpanded ? toggle.labelLess : toggle.labelMore;
}

function setupReleasesToggle(root: HTMLElement): void {
  const toggle = findReleasesToggle(root);
  if (toggle == null) return;

  setExpanded(toggle, false);
  toggle.button.hidden = false;

  toggle.button.addEventListener('click', () => {
    const isExpanded = toggle.button.getAttribute('aria-expanded') === 'true';
    setExpanded(toggle, !isExpanded);
  });
}

for (const root of document.querySelectorAll<HTMLElement>('[data-releases]')) {
  setupReleasesToggle(root);
}
