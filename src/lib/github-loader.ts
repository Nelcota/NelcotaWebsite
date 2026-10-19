import type { Loader, LoaderContext } from 'astro/loaders';
import { errorMessage, fetchRepoSnapshot, isGithubUnavailable } from './github.ts';
import {
  type GithubRepoEntry,
  type GithubSnapshot,
  githubRepoEntrySchema,
  snapshotEntry,
} from './github-schema.ts';

export type { GithubRelease, GithubRepoEntry } from './github-schema.ts';

export interface GithubLoaderOptions {
  /** "owner/name" */
  readonly repo: string;
  /** Committed fallback used when the API fails or is rate limited (already validated). */
  readonly snapshot: GithubSnapshot;
  readonly token?: string | undefined;
}

const ENTRY_ID = 'repo';

/** Live data from the API, or the snapshot when GitHub or the network fails. */
async function resolveEntry(
  { repo, snapshot, token }: GithubLoaderOptions,
  logger: LoaderContext['logger'],
): Promise<GithubRepoEntry> {
  try {
    const data = await fetchRepoSnapshot(repo, {
      token,
      previous: snapshot,
      onWarning: (message) => logger.warn(message),
    });
    logger.info(`Fetched ${repo} and ${data.repo.releases.length} releases from GitHub.`);
    return { ...data.repo, fetchedAt: data.fetchedAt, source: 'api' };
  } catch (error) {
    if (!isGithubUnavailable(error)) throw error;

    logger.warn(
      `GitHub API unavailable (${errorMessage(error)}). Falling back to src/data/github-snapshot.json ` +
        `from ${snapshot.fetchedAt}. Run \`pnpm snapshot\` to refresh it.`,
    );
    return snapshotEntry(snapshot);
  }
}

/**
 * Content Layer loader with a single entry: the Nelcota repository and its
 * recent releases. The build never breaks on network trouble: it falls back to
 * the committed snapshot and logs a warning.
 */
export function githubLoader(options: GithubLoaderOptions): Loader {
  return {
    name: 'nelcota-github-loader',
    schema: githubRepoEntrySchema,
    async load({ store, logger, parseData, generateDigest, meta }) {
      const data = await resolveEntry(options, logger);

      store.clear();
      const entry = await parseData({ id: ENTRY_ID, data: { ...data } });
      store.set({ id: ENTRY_ID, data: entry, digest: generateDigest(entry) });

      meta.set('source', data.source);
      meta.set('fetchedAt', data.fetchedAt);
    },
  };
}
