import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { fetchOrgSnapshot, type GithubSnapshot } from './github.ts';

export const githubReleaseSchema = z.object({
  tag: z.string(),
  name: z.string().nullable(),
  url: z.url(),
  publishedAt: z.string().nullable(),
});

export const githubRepoSchema = z.object({
  name: z.string(),
  url: z.url(),
  description: z.string().nullable(),
  homepage: z.string().nullable(),
  stars: z.number().int().nonnegative(),
  forks: z.number().int().nonnegative(),
  openIssues: z.number().int().nonnegative(),
  language: z.string().nullable(),
  license: z.string().nullable(),
  pushedAt: z.string(),
  defaultBranch: z.string(),
  archived: z.boolean(),
  latestRelease: githubReleaseSchema.nullable(),
  /** ISO timestamp of the data; the snapshot date when the API was unavailable. */
  fetchedAt: z.string(),
  source: z.enum(['api', 'snapshot']),
});

export type GithubRepoEntry = z.infer<typeof githubRepoSchema>;

export interface GithubLoaderOptions {
  org: string;
  /** Committed fallback used when the API fails or is rate limited. */
  snapshot: GithubSnapshot;
  token?: string | undefined;
}

/**
 * Content Layer loader: one entry per public repository of the organization.
 * The build never breaks on network trouble: it falls back to the committed
 * snapshot and logs a warning.
 */
export function githubLoader({ org, snapshot, token }: GithubLoaderOptions): Loader {
  return {
    name: 'nelcota-github-loader',
    schema: githubRepoSchema,
    async load({ store, logger, parseData, generateDigest, meta }) {
      let data: GithubSnapshot = snapshot;
      let source: GithubRepoEntry['source'] = 'snapshot';

      try {
        data = await fetchOrgSnapshot(org, {
          token,
          previous: snapshot,
          onWarning: (message) => logger.warn(message),
        });
        source = 'api';
        logger.info(
          `Fetched ${data.repos.length} public repositories of ${org} from the GitHub API.`,
        );
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        logger.warn(
          `GitHub API unavailable (${reason}). Falling back to src/data/github-snapshot.json ` +
            `from ${snapshot.fetchedAt}. Run \`pnpm snapshot\` to refresh it.`,
        );
      }

      store.clear();
      for (const repo of data.repos) {
        const entry = await parseData({
          id: repo.name,
          data: { ...repo, fetchedAt: data.fetchedAt, source },
        });
        store.set({ id: repo.name, data: entry, digest: generateDigest(entry) });
      }

      meta.set('source', source);
      meta.set('fetchedAt', data.fetchedAt);
    },
  };
}
