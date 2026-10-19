import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  fold,
  parseIndex,
  queryTerms,
  SearchIndexError,
  search,
} from '../../src/scripts/docs-search-index.ts';

const INDEX = [
  [
    'Instalação',
    '/docs/install/',
    [
      ['', '', 'Baixe o binário.'],
      ['docker', 'Docker', 'Rode o contêiner com docker compose.'],
    ],
  ],
  ['Migrations', '/docs/migrate/', [['run', 'Run migrations', 'Apply pending migrations.']]],
];

describe('fold', () => {
  it('drops accents and case while keeping one character per input character', () => {
    const folded = fold('Instalação ÉPICA');

    assert.equal(folded, 'instalacao epica');
    assert.equal(folded.length, 'Instalação ÉPICA'.length);
  });
});

describe('queryTerms', () => {
  it('splits on whitespace, folds and caps the number of terms', () => {
    const terms = queryTerms('  Contêiner   DOCKER a b c d e f g h ');

    assert.deepEqual(terms, ['conteiner', 'docker', 'a', 'b', 'c', 'd', 'e', 'f']);
  });
});

describe('parseIndex', () => {
  it('turns pages into entries with anchored urls', () => {
    const entries = parseIndex(INDEX);

    assert.equal(entries.length, 3);
    assert.equal(entries[0]?.url, '/docs/install/');
    assert.equal(entries[1]?.url, '/docs/install/#docker');
    assert.equal(entries[0]?.folded.title, 'instalacao');
  });

  it('rejects anything that is not a list of pages with a SearchIndexError', () => {
    assert.throws(() => parseIndex({ pages: [] }), SearchIndexError);
    assert.throws(() => parseIndex([['title only']]), SearchIndexError);
  });
});

describe('search', () => {
  const entries = parseIndex(INDEX);

  it('finds accent-insensitive matches and ranks heading hits first', () => {
    const result = search(entries, 'docker');

    assert.equal(result.total, 1);
    assert.equal(result.shown[0]?.url, '/docs/install/#docker');
  });

  it('requires every term to match', () => {
    assert.equal(search(entries, 'docker migrations').total, 0);
    assert.equal(search(entries, 'instalacao binario').total, 1);
  });

  it('ranks by score and keeps index order for equal scores', () => {
    const urls = search(entries, 'o').shown.map((entry) => entry.url);

    assert.deepEqual(urls, ['/docs/install/#docker', '/docs/migrate/#run', '/docs/install/']);
  });

  it('returns nothing for a blank query', () => {
    assert.deepEqual(search(entries, '   '), { shown: [], total: 0 });
  });
});
