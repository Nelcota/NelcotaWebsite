/**
 * GCRA (generic cell rate algorithm) decision, the same rule the RateLimit
 * crate uses. Pure: the caller keeps the theoretical arrival time (TAT) and
 * passes the clock, so it can be tested without timers.
 */

export interface GcraRule {
  /** Time between two requests at the steady rate. */
  readonly intervalMs: number;
  /** How far ahead of the clock the TAT may run: the burst allowance. */
  readonly toleranceMs: number;
}

export type GcraOutcome = 'ok' | 'limited' | 'blocked';

export interface GcraInput {
  readonly tat: number;
  readonly now: number;
  /** False when the rule store (memory or Valkey) cannot be reached. */
  readonly storeAvailable: boolean;
}

export interface GcraDecision {
  readonly outcome: GcraOutcome;
  /** TAT to keep for the next request; unchanged unless accepted. */
  readonly tat: number;
  /** Wait until the next accepted request; 0 unless limited. */
  readonly retryAfterMs: number;
}

export function createGcraRule(ratePerSecond: number, burst: number): GcraRule {
  if (!(ratePerSecond > 0)) throw new RangeError(`ratePerSecond must be > 0, got ${ratePerSecond}`);
  if (!Number.isInteger(burst) || burst < 1) {
    throw new RangeError(`burst must be an integer >= 1, got ${burst}`);
  }

  const intervalMs = 1000 / ratePerSecond;
  return { intervalMs, toleranceMs: intervalMs * (burst - 1) };
}

export function decideGcra(rule: GcraRule, input: GcraInput): GcraDecision {
  // Fail closed: without the store nothing is checked, so nothing passes.
  if (!input.storeAvailable) return { outcome: 'blocked', tat: input.tat, retryAfterMs: 0 };

  const tat = Math.max(input.tat, input.now);
  if (tat - input.now > rule.toleranceMs) {
    return { outcome: 'limited', tat: input.tat, retryAfterMs: tat - rule.toleranceMs - input.now };
  }

  return { outcome: 'ok', tat: tat + rule.intervalMs, retryAfterMs: 0 };
}
