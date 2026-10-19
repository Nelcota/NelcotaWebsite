import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseFigure } from '../../src/lib/figures.ts';

describe('parseFigure', () => {
  it('reads thousands and decimals the Portuguese way', () => {
    assert.deepEqual(parseFigure('1.965', 'pt-br'), { target: 1965, decimals: 0 });
    assert.deepEqual(parseFigure('4,4', 'pt-br'), { target: 4.4, decimals: 1 });
  });

  it('reads thousands and decimals the English way', () => {
    assert.deepEqual(parseFigure('1,965', 'en'), { target: 1965, decimals: 0 });
    assert.deepEqual(parseFigure('4.4', 'en'), { target: 4.4, decimals: 1 });
    assert.deepEqual(parseFigure('0', 'en'), { target: 0, decimals: 0 });
  });

  it('refuses text that is not a number', () => {
    assert.throws(() => parseFigure('fast', 'en'), RangeError);
    assert.throws(() => parseFigure('', 'pt-br'), RangeError);
  });
});
