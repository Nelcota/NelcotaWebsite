/**
 * Refreshes src/data/github-snapshot.json, the offline fallback for the
 * GitHub content loader. Run with `pnpm snapshot` (Node 26 strips the types).
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fetchRepoSnapshot } from '../src/lib/github.ts';
import { type GithubSnapshot, parseSnapshot, readGithubToken } from '../src/lib/github-schema.ts';
import { REPO } from '../src/lib/site.ts';

const TARGET = new URL('../src/data/github-snapshot.json', import.meta.url);
const JSON_INDENT = 2;

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

/** The committed snapshot, or undefined on a first run. Invalid content is an error. */
async function readPrevious(): Promise<GithubSnapshot | undefined> {
  let text: string;
  try {
    text = await readFile(TARGET, 'utf8');
  } catch (error) {
    if (isMissingFile(error)) return undefined;
    throw error;
  }

  return parseSnapshot(JSON.parse(text));
}

const snapshot = await fetchRepoSnapshot(REPO, {
  token: readGithubToken(),
  previous: await readPrevious(),
  onWarning: (message) => console.warn(`warning: ${message}`),
});

await writeFile(TARGET, `${JSON.stringify(snapshot, null, JSON_INDENT)}\n`);
console.log(
  `Saved ${REPO} with ${snapshot.repo.releases.length} releases to src/data/github-snapshot.json (fetched ${snapshot.fetchedAt}).`,
);
