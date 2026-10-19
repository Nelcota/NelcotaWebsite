/**
 * Schemas for every piece of GitHub data crossing a boundary: the REST API
 * responses, the committed snapshot file and the content-layer entry.
 * No `astro:*` imports, so `node scripts/snapshot.ts` can load it directly.
 */
import { z } from 'astro/zod';

/* ---------- GitHub REST API (input) ---------- */

export const apiRepoSchema = z.object({
  full_name: z.string(),
  html_url: z.url(),
  description: z.string().nullable(),
  homepage: z.string().nullable(),
  stargazers_count: z.number().int().nonnegative(),
  forks_count: z.number().int().nonnegative(),
  open_issues_count: z.number().int().nonnegative(),
  language: z.string().nullable(),
  license: z.object({ spdx_id: z.string().nullable() }).nullable(),
  pushed_at: z.iso.datetime(),
  default_branch: z.string(),
  topics: z.array(z.string()).optional(),
});

export const apiReleaseSchema = z.object({
  tag_name: z.string(),
  name: z.string().nullable(),
  html_url: z.url(),
  published_at: z.iso.datetime().nullable(),
  draft: z.boolean(),
  prerelease: z.boolean(),
});

export const apiReleaseListSchema = z.array(apiReleaseSchema);

export type ApiRepo = z.infer<typeof apiRepoSchema>;
export type ApiRelease = z.infer<typeof apiReleaseSchema>;

/* ---------- Normalized data (snapshot file and content entry) ---------- */

export const githubReleaseSchema = z
  .object({
    tag: z.string(),
    name: z.string().nullable(),
    url: z.url(),
    publishedAt: z.iso.datetime().nullable(),
  })
  .readonly();

const repoShape = {
  /** "owner/name", e.g. "Nelcota/Nelcota". */
  fullName: z.string(),
  url: z.url(),
  description: z.string().nullable(),
  homepage: z.string().nullable(),
  stars: z.number().int().nonnegative(),
  forks: z.number().int().nonnegative(),
  openIssues: z.number().int().nonnegative(),
  language: z.string().nullable(),
  /** SPDX identifier, e.g. "Apache-2.0". */
  license: z.string().nullable(),
  pushedAt: z.iso.datetime(),
  defaultBranch: z.string(),
  topics: z.array(z.string()).readonly(),
  /** Most recent published releases, newest first (drafts and prereleases excluded). */
  releases: z.array(githubReleaseSchema).readonly(),
};

export const githubRepoSchema = z.object(repoShape).readonly();

export const githubSnapshotSchema = z
  .object({
    fetchedAt: z.iso.datetime(),
    repo: githubRepoSchema,
  })
  .readonly();

/** Content-layer entry: the repository plus where and when the data came from. */
export const githubRepoEntrySchema = z
  .object({
    ...repoShape,
    /** ISO timestamp of the data; the snapshot date when the API was unavailable. */
    fetchedAt: z.iso.datetime(),
    source: z.enum(['api', 'snapshot']),
  })
  .readonly();

export type GithubRelease = z.infer<typeof githubReleaseSchema>;
export type GithubSnapshot = z.infer<typeof githubSnapshotSchema>;
export type GithubRepoEntry = z.infer<typeof githubRepoEntrySchema>;

export class InvalidSnapshotError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'InvalidSnapshotError';
  }
}

/** Validates the committed snapshot (src/data/github-snapshot.json). */
export function parseSnapshot(input: unknown): GithubSnapshot {
  const result = githubSnapshotSchema.safeParse(input);
  if (!result.success) {
    throw new InvalidSnapshotError(
      `src/data/github-snapshot.json is invalid: ${z.prettifyError(result.error)}`,
      { cause: result.error },
    );
  }

  return result.data;
}

/** The snapshot as a content entry, for when the GitHub API is not used. */
export function snapshotEntry(snapshot: GithubSnapshot): GithubRepoEntry {
  return { ...snapshot.repo, fetchedAt: snapshot.fetchedAt, source: 'snapshot' };
}

/* ---------- Environment ---------- */

const githubTokenSchema = z
  .string()
  .optional()
  .transform((value) => {
    if (value == null) return undefined;

    const token = value.trim();
    return token.length === 0 ? undefined : token;
  });

/** GITHUB_TOKEN from the environment; unset or blank means anonymous requests. */
export function readGithubToken(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return githubTokenSchema.parse(env.GITHUB_TOKEN);
}
