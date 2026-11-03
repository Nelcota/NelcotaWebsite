/**
 * Opening screen of the home (components/house/home/HomeIntro.astro). It plays once per tab:
 * later visits, and people who ask for reduced motion, go straight to the page. The logo in
 * the header ([data-home-replay]) plays it again.
 */
import { prefersReducedMotion } from './home-motion.ts';

const SEEN_KEY = 'nelcota-intro-seen';
/** The curtain is gone at 1550 + 900 ms; scrolling waits until then, as in the mockup. */
const INTRO_MS = 2500;
const SKIP_CLASS = 'hm-skip-intro';
const LOCK_CLASS = 'hm-lock';

let unlockTimer = 0;

function introSeen(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    // Storage blocked: treat as a first visit, the opening is short.
    return false;
  }
}

function markIntroSeen(): void {
  try {
    window.sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Storage blocked: the opening plays again next time, nothing breaks.
  }
}

function lockScrollDuringIntro(): void {
  const root = document.documentElement;
  root.classList.add(LOCK_CLASS);
  window.clearTimeout(unlockTimer);
  unlockTimer = window.setTimeout(() => root.classList.remove(LOCK_CLASS), INTRO_MS);
}

/** CSS animations only run once; cancel + play starts them over, delays included. */
function restartAnimations(): void {
  const scenes = document.querySelectorAll<HTMLElement>('[data-home-intro], [data-home-hero]');
  for (const scene of scenes) {
    for (const animation of scene.getAnimations({ subtree: true })) {
      animation.cancel();
      animation.play();
    }
  }
}

function replayIntro(event: MouseEvent): void {
  if (prefersReducedMotion()) return;

  event.preventDefault();
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.documentElement.classList.remove(SKIP_CLASS);
  restartAnimations();
  lockScrollDuringIntro();
}

function setupIntro(): void {
  const replayLink = document.querySelector<HTMLAnchorElement>('[data-home-replay]');
  replayLink?.addEventListener('click', replayIntro);

  if (introSeen() || prefersReducedMotion()) {
    document.documentElement.classList.add(SKIP_CLASS);
    return;
  }

  markIntroSeen();
  lockScrollDuringIntro();
}

setupIntro();
