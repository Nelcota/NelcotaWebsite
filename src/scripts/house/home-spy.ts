/**
 * Underlines the header link of the home section being read ([data-home-spy] → section id).
 * A section counts once its top passes 40% of the screen height, as in the mockup.
 * Only a visual cue: the links lead to other pages, so aria-current would be wrong.
 */
const PROBE_RATIO = 0.4;

interface SpyTarget {
  readonly link: HTMLAnchorElement;
  readonly section: HTMLElement;
}

function spyTargets(): readonly SpyTarget[] {
  const links = document.querySelectorAll<HTMLAnchorElement>('a[data-home-spy]');
  const targets: SpyTarget[] = [];
  for (const link of links) {
    const section = document.getElementById(link.dataset.homeSpy ?? '');
    if (section == null) continue;

    targets.push({ link, section });
  }
  return targets;
}

function currentTarget(targets: readonly SpyTarget[]): SpyTarget | undefined {
  const probe = window.innerHeight * PROBE_RATIO;
  return targets.filter((target) => target.section.getBoundingClientRect().top <= probe).at(-1);
}

function setupSpy(): void {
  const targets = spyTargets();
  if (targets.length === 0) return;

  let scheduled = false;
  const update = (): void => {
    scheduled = false;
    const active = currentTarget(targets);
    for (const target of targets) target.link.toggleAttribute('data-active', target === active);
  };
  const schedule = (): void => {
    if (scheduled) return;

    scheduled = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();
}

setupSpy();
