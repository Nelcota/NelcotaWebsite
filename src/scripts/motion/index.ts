/**
 * Scroll animations for the home page, loaded on demand by ./loader.ts.
 * Each effect is opt-in through a data attribute and only touches elements
 * that are still below the fold, so nothing already on screen blinks out and
 * back in. All of it is undone if the visitor turns on reduced motion.
 *
 *   [data-words]       heading: words rise in one after the other
 *   [data-fade]        block: fades up
 *   [data-stagger]     list: items rise one after the other
 *   [data-count-to]    number: counts up from zero (an sr-only twin keeps the value)
 *   [data-manifesto]   paragraph: words light up as it scrolls by
 *   [data-panel-frame] screenshot frame: grows to full size while scrolling
 *   [data-cascade]     list: cards slide in on a diagonal
 *   .fan               hero card fan: opens wider as the hero scrolls away
 *
 * Two safety nets keep content reachable: a focused element inside a block
 * that has not played yet finishes its animation at once, and the trigger
 * positions are measured again whenever the page height changes (FAQ answers,
 * tabs, late images).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** How far into the viewport a block must come before it animates. */
const ENTER = 'top 85%';
const EASE = 'expo.out';
const FOLD_RATIO = 0.92;
const REFRESH_DELAY_MS = 150;

/** Element → the entrance animation that still hides it, for the focus safety net. */
const pending = new WeakMap<Element, gsap.core.Animation>();

const all = <T extends Element = HTMLElement>(selector: string): T[] => [
  ...document.querySelectorAll<T>(selector),
];

/** Still below the visible screen: safe to hide and animate in. */
const isBelowFold = (element: Element): boolean =>
  element.getBoundingClientRect().top > window.innerHeight * FOLD_RATIO;

/** A one-time entrance on scroll, remembered until it has played. */
function enter(trigger: Element, targets: gsap.TweenTarget, vars: gsap.TweenVars): void {
  const tween = gsap.from(targets, {
    duration: 1,
    ease: EASE,
    ...vars,
    scrollTrigger: { trigger, start: ENTER, once: true },
    onComplete: () => pending.delete(trigger),
  });
  pending.set(trigger, tween);
}

function revealWords(): void {
  for (const heading of all('[data-words]').filter(isBelowFold)) {
    enter(heading, heading.querySelectorAll('.word'), {
      yPercent: 70,
      opacity: 0,
      filter: 'blur(10px)',
      stagger: 0.07,
      clearProps: 'filter',
    });
  }
}

function fadeUp(): void {
  for (const block of all('[data-fade]').filter(isBelowFold)) {
    enter(block, block, { y: 32, opacity: 0 });
  }

  for (const list of all('[data-stagger]').filter(isBelowFold)) {
    enter(list, list.children, { y: 48, opacity: 0, stagger: 0.09 });
  }
}

/** Counts a number up from zero; returns how to put the final text back. */
function countUp(element: HTMLElement): (() => void) | null {
  const target = Number.parseFloat(element.dataset.countTo ?? '');
  const decimals = Number.parseInt(element.dataset.decimals ?? '', 10);
  const locale = element.dataset.locale;
  if (!Number.isFinite(target) || !Number.isFinite(decimals) || locale == null) return null;

  const format = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const finalText = element.textContent;
  const counter = { value: 0 };
  // Off screen when this runs: start at zero so the list never flashes the final value first.
  element.textContent = format.format(0);

  gsap.to(counter, {
    value: target,
    duration: 1.8,
    ease: 'power3.out',
    scrollTrigger: { trigger: element, start: ENTER, once: true },
    onUpdate: () => {
      element.textContent = format.format(counter.value);
    },
    // End on the exact text from the page (its own thousands separator and unit format).
    onComplete: () => {
      element.textContent = finalText;
    },
  });

  return () => {
    element.textContent = finalText;
  };
}

function countAll(): (() => void)[] {
  return all('[data-count-to]')
    .filter(isBelowFold)
    .map(countUp)
    .filter((restore): restore is () => void => restore != null);
}

function lightUpManifesto(): void {
  for (const paragraph of all('[data-manifesto]').filter(isBelowFold)) {
    gsap.fromTo(
      paragraph.querySelectorAll('.mw'),
      { opacity: 0.25 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        // Fully lit while the paragraph is still well inside the screen.
        scrollTrigger: { trigger: paragraph, start: 'top 85%', end: 'center 60%', scrub: 0.6 },
      },
    );
  }
}

function growPanel(): void {
  for (const frame of all('[data-panel-frame]').filter(isBelowFold)) {
    gsap.fromTo(
      frame,
      { scale: 0.84, y: 48, rotateX: 8, transformPerspective: 1600 },
      {
        scale: 1,
        y: 0,
        rotateX: 0,
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top 95%', end: 'top 25%', scrub: 0.6 },
      },
    );
  }
}

function cascade(): void {
  for (const list of all('[data-cascade]').filter(isBelowFold)) {
    enter(list, list.children, {
      x: -64,
      y: 96,
      rotate: -5,
      opacity: 0,
      duration: 1.1,
      stagger: 0.12,
    });
  }
}

/** Opens the fan through a multiplier, so the breakpoint values of --spread stay in CSS. */
function openFan(): void {
  for (const fan of all('.fan')) {
    gsap.fromTo(
      fan,
      { '--open': 1 },
      {
        '--open': 1.18,
        y: -40,
        ease: 'none',
        scrollTrigger: { trigger: fan, start: 'top 75%', end: 'bottom top', scrub: 0.6 },
      },
    );
  }
}

/** Tab or a skip link landing inside a block that has not played: show it at once. */
function finishOnFocus(event: FocusEvent): void {
  for (
    let node = event.target instanceof Element ? event.target : null;
    node != null;
    node = node.parentElement
  ) {
    const tween = pending.get(node);
    if (tween == null) continue;

    tween.progress(1);
    pending.delete(node);
  }
}

/** Measures the triggers again after the page height settles. */
function refreshOnResize(): ResizeObserver {
  let timer = 0;
  const observer = new ResizeObserver(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => ScrollTrigger.refresh(), REFRESH_DELAY_MS);
  });
  observer.observe(document.body);

  return observer;
}

const media = gsap.matchMedia();
media.add('(prefers-reduced-motion: no-preference)', () => {
  revealWords();
  fadeUp();
  const restoreCounters = countAll();
  lightUpManifesto();
  growPanel();
  cascade();
  openFan();
  document.addEventListener('focusin', finishOnFocus);
  const resizeObserver = refreshOnResize();

  // Reduced motion turned on mid-visit: GSAP reverts the tweens, this puts the rest back.
  return () => {
    for (const restore of restoreCounters) restore();
    document.removeEventListener('focusin', finishOnFocus);
    resizeObserver.disconnect();
  };
});

// Lets tests (and anyone debugging) know the scroll effects are wired up.
document.documentElement.dataset.motion = 'ready';
