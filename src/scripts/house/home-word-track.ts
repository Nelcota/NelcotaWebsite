/**
 * "Nelcota é ___" on the home (components/house/home/HomeProducts.astro). The section is four
 * screens tall; as its sticky screen scrolls by, the word, the card on top, the bars and the
 * counter follow. The bars and [data-word-jump] links scroll to a given word.
 */
import { navHeight, scrollBehavior } from './home-motion.ts';

type CardPosition = 'next' | 'current' | 'prev1' | 'prev2' | 'gone';

interface Track {
  readonly section: HTMLElement;
  readonly screen: HTMLElement;
  readonly cards: readonly HTMLElement[];
  readonly dots: readonly HTMLButtonElement[];
  readonly line: HTMLElement;
  readonly text: HTMLElement;
  readonly label: HTMLElement;
  readonly counter: HTMLElement;
  readonly prefix: string;
}

function findTrack(): Track | null {
  const section = document.querySelector<HTMLElement>('[data-word-track]');
  if (section == null) return null;

  const screen = section.querySelector<HTMLElement>('[data-word-sticky]');
  const line = section.querySelector<HTMLElement>('[data-word-line]');
  const text = section.querySelector<HTMLElement>('[data-word-text]');
  const label = section.querySelector<HTMLElement>('[data-word-label]');
  const counter = section.querySelector<HTMLElement>('[data-word-counter]');
  if (screen == null || line == null || text == null || label == null || counter == null)
    return null;

  const cards = [...section.querySelectorAll<HTMLElement>('[data-word-card]')];
  const dots = [...section.querySelectorAll<HTMLButtonElement>('[data-word-dot]')];
  if (cards.length === 0) return null;

  const prefix = section.dataset.wordPrefix ?? '';
  return { section, screen, cards, dots, line, text, label, counter, prefix };
}

function positionFor(offset: number): CardPosition {
  if (offset > 0) return 'next';
  if (offset === 0) return 'current';
  if (offset === -1) return 'prev1';
  if (offset === -2) return 'prev2';
  return 'gone';
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** How far the sticky screen can travel inside the section. */
function scrollRange(track: Track): number {
  return Math.max(0, track.section.offsetHeight - track.screen.offsetHeight);
}

function indexFromScroll(track: Track): number {
  const range = scrollRange(track);
  if (range === 0) return 0;

  const progress = (navHeight() - track.section.getBoundingClientRect().top) / range;
  const count = track.cards.length;
  return Math.min(count - 1, Math.max(0, Math.floor(progress * count * 0.999)));
}

/** Only the card on top is read out and reachable with the keyboard. */
function placeCard(card: HTMLElement, offset: number): void {
  card.dataset.pos = positionFor(offset);
  const link = card.querySelector<HTMLAnchorElement>('a');
  if (offset === 0) {
    card.removeAttribute('aria-hidden');
    link?.removeAttribute('tabindex');
    return;
  }
  card.setAttribute('aria-hidden', 'true');
  link?.setAttribute('tabindex', '-1');
}

function placeCards(track: Track, index: number): void {
  track.cards.forEach((card, cardIndex) => {
    placeCard(card, cardIndex - index);
  });
}

function showWord(track: Track, index: number, phase: 'a' | 'b'): void {
  const word = track.cards[index]?.dataset.word ?? '';
  track.text.textContent = word;
  track.label.textContent = `${track.prefix} ${word}`;
  track.line.dataset.phase = phase;
  track.counter.textContent = `${pad(index + 1)} / ${pad(track.cards.length)}`;
  track.dots.forEach((dot, dotIndex) => {
    dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
  });
}

function scrollToWord(track: Track, index: number): void {
  const start = track.section.getBoundingClientRect().top + window.scrollY - navHeight();
  const top = start + (scrollRange(track) * (index + 0.5)) / track.cards.length;
  window.scrollTo({ top, behavior: scrollBehavior() });
}

function setupWordTrack(): void {
  const track = findTrack();
  if (track == null) return;

  let current = 0;
  let phase: 'a' | 'b' = 'b';
  let scheduled = false;

  const update = (): void => {
    scheduled = false;
    const index = indexFromScroll(track);
    if (index === current) return;

    current = index;
    phase = phase === 'a' ? 'b' : 'a';
    placeCards(track, index);
    showWord(track, index, phase);
  };
  const schedule = (): void => {
    if (scheduled) return;

    scheduled = true;
    window.requestAnimationFrame(update);
  };

  track.dots.forEach((dot, index) => {
    dot.addEventListener('click', () => scrollToWord(track, index));
  });
  for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-word-jump]')) {
    const index = Number.parseInt(link.dataset.wordJump ?? '', 10);
    if (Number.isNaN(index)) continue;

    link.addEventListener('click', (event) => {
      event.preventDefault();
      scrollToWord(track, index);
    });
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();
}

setupWordTrack();
