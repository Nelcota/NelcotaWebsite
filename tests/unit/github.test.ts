import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import {
  fetchRepoSnapshot,
  GithubResponseError,
  isGithubUnavailable,
} from '../../src/lib/github.ts';

const REPO = {
  full_name: 'Nelcota/Nelcota',
  html_url: 'https://github.com/Nelcota/Nelcota',
  description: null,
  homepage: '  ',
  stargazers_count: 1,
  forks_count: 0,
  open_issues_count: 0,
  language: 'Rust',
  license: { spdx_id: 'NOASSERTION' },
  pushed_at: '2026-10-17T12:00:00Z',
  default_branch: 'main',
};

const release = (tag: string, publishedAt: string | null) => ({
  tag_name: tag,
  name: null,
  html_url: `https://github.com/Nelcota/Nelcota/releases/tag/${tag}`,
  published_at: publishedAt,
  draft: false,
  prerelease: false,
});

const realFetch = globalThis.fetch;

/** Answers by URL suffix; every other request is a 404. */
function stubFetch(routes: Readonly<Record<string, () => Response>>): void {
  globalThis.fetch = async (input) => {
    const url = String(input);
    const route = Object.entries(routes).find(([suffix]) => url.includes(suffix));
    if (route == null) return new Response('', { status: 404 });

    return route[1]();
  };
}

const json = (body: unknown): Response => Response.json(body);

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe('github snapshot', () => {
  it('treats a 200 answer that is not JSON as GitHub being unavailable', async () => {
    stubFetch({ '/repos/Nelcota/Nelcota': () => new Response('<html>outage</html>') });

    const error = await fetchRepoSnapshot('Nelcota/Nelcota').catch((caught: unknown) => caught);

    assert.ok(error instanceof GithubResponseError);
    assert.equal(isGithubUnavailable(error), true);
  });

  it('lets coding errors through instead of hiding them behind the snapshot', () => {
    assert.equal(isGithubUnavailable(new TypeError('fetch failed')), true);
    assert.equal(isGithubUnavailable(new TypeError('Cannot read properties of undefined')), false);
  });

  it('orders releases by publication date, unpublished last', async () => {
    stubFetch({
      '/releases': () =>
        json([
          release('v0.3.0', '2026-09-01T00:00:00Z'),
          release('v0.4.0', '2026-10-01T00:00:00Z'),
          release('v0.4.1-draftless', null),
        ]),
      '/repos/Nelcota/Nelcota': () => json(REPO),
    });

    const snapshot = await fetchRepoSnapshot('Nelcota/Nelcota');

    assert.deepEqual(
      snapshot.repo.releases.map((item) => item.tag),
      ['v0.4.0', 'v0.3.0', 'v0.4.1-draftless'],
    );
  });

  it('normalizes empty homepage and unknown license to null', async () => {
    stubFetch({ '/releases': () => json([]), '/repos/Nelcota/Nelcota': () => json(REPO) });

    const snapshot = await fetchRepoSnapshot('Nelcota/Nelcota');

    assert.equal(snapshot.repo.homepage, null);
    assert.equal(snapshot.repo.license, null);
    assert.deepEqual(snapshot.repo.releases, []);
  });

  it('keeps at most `releaseCount` snapshot releases when the releases request fails', async () => {
    const previous = await (async () => {
      stubFetch({
        '/releases': () =>
          json([1, 2, 3].map((n) => release(`v0.${n}.0`, `2026-0${n}-01T00:00:00Z`))),
        '/repos/Nelcota/Nelcota': () => json(REPO),
      });
      return fetchRepoSnapshot('Nelcota/Nelcota');
    })();
    const warnings: string[] = [];
    stubFetch({
      '/releases': () => new Response('', { status: 503 }),
      '/repos/Nelcota/Nelcota': () => json(REPO),
    });

    const snapshot = await fetchRepoSnapshot('Nelcota/Nelcota', {
      previous,
      releaseCount: 2,
      onWarning: (message) => warnings.push(message),
    });

    assert.equal(snapshot.repo.releases.length, 2);
    assert.equal(warnings.length, 1);
  });
});
