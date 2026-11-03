/**
 * DOM side of the "Teste o limite" demo: finds the elements of RateLimitDemo.astro and writes
 * text and data-attributes only (strict CSP, no inline styles).
 */
import { RATE_LIMIT_DEMO } from '../../data/house/rate-limit.ts';
import type { GcraDecision } from '../../utils/gcra.ts';
import { type DemoCounts, type DemoState, isDemoOutcome } from '../../utils/rate-limit-state.ts';

export interface DemoView {
  readonly stream: HTMLButtonElement;
  readonly down: HTMLButtonElement;
  readonly counters: readonly HTMLElement[];
  readonly timeline: HTMLElement;
  readonly slots: readonly HTMLElement[];
  readonly result: HTMLElement;
}

function resultText(decision: GcraDecision): string {
  if (decision.outcome === 'blocked') return RATE_LIMIT_DEMO.blocked;
  if (decision.outcome === 'ok') return RATE_LIMIT_DEMO.accepted;

  // Portuguese decimal comma, as in the mockup: "0,20 s".
  const seconds = (decision.retryAfterMs / 1000).toFixed(2).replace('.', ',');
  return `${RATE_LIMIT_DEMO.limitedPrefix}${seconds} s`;
}

function timelineLabel(counts: DemoCounts): string {
  return `${counts.ok} aceitas, ${counts.limited} limitadas e ${counts.blocked} bloqueadas por falha`;
}

export function findView(root: HTMLElement): DemoView | null {
  const stream = root.querySelector<HTMLButtonElement>('[data-demo-action="stream"]');
  const down = root.querySelector<HTMLButtonElement>('[data-demo-action="down"]');
  const timeline = root.querySelector<HTMLElement>('[data-demo-timeline]');
  const result = root.querySelector<HTMLElement>('[data-demo-result]');
  if (stream == null || down == null || timeline == null || result == null) return null;

  const counters = [...root.querySelectorAll<HTMLElement>('[data-demo-count]')];
  const slots = [...timeline.querySelectorAll<HTMLElement>('[data-demo-slot]')];
  return { stream, down, counters, timeline, slots, result };
}

export function renderCounts(view: DemoView, state: DemoState): void {
  for (const counter of view.counters) {
    const kind = counter.dataset.demoCount;
    if (!isDemoOutcome(kind)) continue;
    counter.textContent = String(state.counts[kind]);
  }
}

export function renderTimeline(view: DemoView, state: DemoState): void {
  // Newest on the right: the log fills the last slots, the rest stay empty.
  const offset = view.slots.length - state.log.length;
  for (const [index, slot] of view.slots.entries()) {
    slot.dataset.kind = state.log[index - offset] ?? 'empty';
  }
  view.timeline.setAttribute('aria-label', timelineLabel(state.counts));
}

export function renderResult(view: DemoView, decision: GcraDecision | null): void {
  view.result.dataset.kind = decision?.outcome ?? 'idle';
  view.result.textContent = decision == null ? RATE_LIMIT_DEMO.idle : resultText(decision);
}

export function renderToggle(
  button: HTMLButtonElement,
  isOn: boolean,
  onLabel: string,
  offLabel: string,
): void {
  button.setAttribute('aria-pressed', String(isOn));
  button.textContent = isOn ? onLabel : offLabel;
}
