import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createGcraRule, decideGcra } from '../../src/utils/gcra.ts';
import {
  clearDemo,
  EMPTY_DEMO,
  sendRequest,
  toggleStoreDown,
} from '../../src/utils/rate-limit-state.ts';

describe('decideGcra', () => {
  const rule = createGcraRule(5, 3);

  it('lets the burst through, then limits with the wait until the next slot', () => {
    let tat = 0;
    const outcomes = [];
    for (let sent = 0; sent < 4; sent += 1) {
      const decision = decideGcra(rule, { tat, now: 1000, storeAvailable: true });
      tat = decision.tat;
      outcomes.push(decision);
    }
    assert.deepEqual(
      outcomes.map((decision) => decision.outcome),
      ['ok', 'ok', 'ok', 'limited'],
    );
    assert.equal(outcomes[3]?.retryAfterMs, 200);
  });

  it('blocks every request when the store is down (fail closed)', () => {
    const decision = decideGcra(rule, { tat: 0, now: 1000, storeAvailable: false });
    assert.deepEqual(decision, { outcome: 'blocked', tat: 0, retryAfterMs: 0 });
  });

  it('refuses rules that cannot work', () => {
    assert.throws(() => createGcraRule(0, 3), RangeError);
    assert.throws(() => createGcraRule(5, 0), RangeError);
    assert.throws(() => createGcraRule(5, 1.5), RangeError);
  });
});

describe('rate limit demo state', () => {
  it('counts ten instant requests as three accepted and seven limited', () => {
    let state = EMPTY_DEMO;
    for (let sent = 0; sent < 10; sent += 1) state = sendRequest(state, 1000).state;
    assert.deepEqual(state.counts, { ok: 3, limited: 7, blocked: 0 });
    assert.equal(state.log.length, 10);
  });

  it('keeps the outage toggle when cleared', () => {
    const down = sendRequest(toggleStoreDown(EMPTY_DEMO), 1000).state;
    assert.equal(down.counts.blocked, 1);
    assert.deepEqual(clearDemo(down), { ...EMPTY_DEMO, storeDown: true });
  });
});
