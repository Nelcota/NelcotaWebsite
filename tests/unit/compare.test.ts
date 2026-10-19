import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CHECKED_ON,
  COMPARE_GROUPS,
  HOME_GROUPS,
  PRODUCT_INFO,
  PRODUCTS,
  RIVALS,
  WINS,
} from '../../src/data/compare.ts';

const LOCALES = ['en', 'pt-br'] as const;
const isBlank = (value: string): boolean => value.trim().length === 0;

describe('comparison data', () => {
  it('fills every cell in both languages', () => {
    for (const group of COMPARE_GROUPS) {
      assert.ok(group.rows.length > 0, `group "${group.title.en}" has no rows`);

      for (const row of group.rows) {
        for (const product of PRODUCTS) {
          for (const locale of LOCALES) {
            assert.ok(
              !isBlank(row.cells[product].text[locale]),
              `${row.label.en} / ${product} / ${locale}`,
            );
          }
        }
      }
    }
  });

  it('marks a row for every product or for none', () => {
    for (const row of COMPARE_GROUPS.flatMap((group) => group.rows)) {
      const marked = PRODUCTS.filter((product) => row.cells[product].support != null);

      assert.ok(
        marked.length === 0 || marked.length === PRODUCTS.length,
        `row "${row.label.en}" mixes marks`,
      );
    }
  });

  it('cites at least one https source per product', () => {
    for (const product of PRODUCTS) {
      const { sources } = PRODUCT_INFO[product];

      assert.ok(sources.length > 0, product);
      for (const source of sources) assert.match(source.href, /^https:\/\//);
    }
  });

  it('keeps Nelcota out of the rivals and dates the check', () => {
    assert.deepEqual(RIVALS, ['supabase', 'pocketbase', 'appwrite']);

    assert.ok(Number.isFinite(Date.parse(CHECKED_ON)));
  });

  it('keeps the home table short and made only of marked rows', () => {
    const homeRows = HOME_GROUPS.flatMap((group) => group.rows);

    assert.ok(homeRows.length > 0);
    assert.ok(homeRows.length <= 10, 'the home table should stay short');
    for (const group of HOME_GROUPS) assert.ok(group.rows.length > 0, group.title.en);
    for (const row of homeRows) assert.equal(row.onHome, true);
  });

  it('states every win in both languages', () => {
    assert.ok(WINS.length > 0);

    for (const win of WINS) {
      for (const locale of LOCALES) {
        assert.ok(!isBlank(win.title[locale]), win.title.en);
        assert.ok(!isBlank(win.body[locale]), win.title.en);
      }
    }
  });
});
