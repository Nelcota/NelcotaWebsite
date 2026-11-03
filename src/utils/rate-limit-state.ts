/**
 * State of the "Teste o limite" demo on /produtos/ratelimit, without the DOM:
 * one GCRA decision at a time, a short log for the timeline and the counters.
 */
import { RATE_LIMIT_DEMO } from '../data/house/rate-limit.ts';
import { createGcraRule, decideGcra, type GcraDecision, type GcraOutcome } from './gcra.ts';

export type DemoCounts = Readonly<Record<GcraOutcome, number>>;

export interface DemoState {
  readonly tat: number;
  readonly storeDown: boolean;
  readonly log: readonly GcraOutcome[];
  readonly counts: DemoCounts;
}

const RULE = createGcraRule(RATE_LIMIT_DEMO.ratePerSecond, RATE_LIMIT_DEMO.burst);

export const DEMO_OUTCOMES: readonly GcraOutcome[] = ['ok', 'limited', 'blocked'];

export const EMPTY_DEMO: DemoState = {
  tat: 0,
  storeDown: false,
  log: [],
  counts: { ok: 0, limited: 0, blocked: 0 },
};

export function isDemoOutcome(value: string | undefined): value is GcraOutcome {
  return DEMO_OUTCOMES.some((outcome) => outcome === value);
}

/** Decides one request at `now` (ms) and returns the decision with the next state. */
export function sendRequest(
  state: DemoState,
  now: number,
): { readonly state: DemoState; readonly decision: GcraDecision } {
  const decision = decideGcra(RULE, { tat: state.tat, now, storeAvailable: !state.storeDown });
  const next: DemoState = {
    ...state,
    tat: decision.tat,
    log: [...state.log, decision.outcome].slice(-RATE_LIMIT_DEMO.slots),
    counts: { ...state.counts, [decision.outcome]: state.counts[decision.outcome] + 1 },
  };
  return { state: next, decision };
}

export function toggleStoreDown(state: DemoState): DemoState {
  return { ...state, storeDown: !state.storeDown };
}

/** Clears the log and counters; the outage toggle stays as it is, like the mockup. */
export function clearDemo(state: DemoState): DemoState {
  return { ...EMPTY_DEMO, storeDown: state.storeDown };
}
