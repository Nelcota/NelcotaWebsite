import { getEntry } from 'astro:content';
import snapshotJson from '../data/github-snapshot.json';
import { type GithubRepoEntry, parseSnapshot, snapshotEntry } from './github-schema.ts';

/**
 * The Nelcota repository as loaded at build time (API or snapshot).
 * Falls back to the committed snapshot when the content store is empty,
 * e.g. a dev server whose loader failed before the snapshot was valid.
 */
export async function loadRepo(): Promise<GithubRepoEntry> {
  const entry = await getEntry('github', 'repo');
  if (entry != null) return entry.data;

  console.warn('[nelcota] GitHub content entry missing; using src/data/github-snapshot.json.');
  return snapshotEntry(parseSnapshot(snapshotJson));
}
