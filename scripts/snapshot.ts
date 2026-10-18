/**
 * Refreshes src/data/github-snapshot.json, the offline fallback for the
 * GitHub content loader. Run with `pnpm snapshot` (Node 26 strips the types).
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fetchOrgSnapshot, type GithubSnapshot } from '../src/lib/github.ts';

const ORG = 'Nelcota';
const target = new URL('../src/data/github-snapshot.json', import.meta.url);

let previous: GithubSnapshot | undefined;
try {
  previous = JSON.parse(await readFile(target, 'utf8')) as GithubSnapshot;
} catch {
  previous = undefined;
}

const snapshot = await fetchOrgSnapshot(ORG, {
  token: process.env.GITHUB_TOKEN,
  previous,
  onWarning: (message) => console.warn(`warning: ${message}`),
});

await writeFile(target, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(
  `Saved ${snapshot.repos.length} repositories of ${ORG} to src/data/github-snapshot.json (fetched ${snapshot.fetchedAt}).`,
);
