/**
 * GitHub data access shared by the build-time content loader and `pnpm snapshot`.
 * Node-only, no Astro imports, so the snapshot script can run with plain `node`.
 */

export interface GithubRelease {
  tag: string;
  name: string | null;
  url: string;
  publishedAt: string | null;
}

export interface GithubRepo {
  /** Repository name inside the organization, e.g. "Nelcota". */
  name: string;
  url: string;
  description: string | null;
  homepage: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  /** SPDX identifier, e.g. "Apache-2.0". */
  license: string | null;
  pushedAt: string;
  defaultBranch: string;
  archived: boolean;
  latestRelease: GithubRelease | null;
}

export interface GithubSnapshot {
  org: string;
  fetchedAt: string;
  repos: GithubRepo[];
}

export class GithubApiError extends Error {
  readonly status: number;
  readonly rateLimitRemaining: number | null;

  constructor(message: string, status: number, rateLimitRemaining: number | null) {
    super(message);
    this.name = 'GithubApiError';
    this.status = status;
    this.rateLimitRemaining = rateLimitRemaining;
  }
}

export interface FetchOptions {
  token?: string | undefined;
  /** Previous snapshot used to keep a repo's release when only that request fails. */
  previous?: GithubSnapshot | undefined;
  onWarning?: ((message: string) => void) | undefined;
  /** Per-request timeout in milliseconds. */
  timeoutMs?: number | undefined;
  apiBase?: string | undefined;
}

interface ApiRepo {
  name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  license: { spdx_id: string | null } | null;
  pushed_at: string;
  default_branch: string;
  archived: boolean;
  fork: boolean;
}

interface ApiRelease {
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string | null;
  draft: boolean;
  prerelease: boolean;
}

async function apiGet<T>(path: string, options: FetchOptions): Promise<T | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'nelcota-website-build',
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await fetch(`${options.apiBase ?? 'https://api.github.com'}${path}`, {
    headers,
    signal: AbortSignal.timeout(options.timeoutMs ?? 10_000),
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    const remainingHeader = response.headers.get('x-ratelimit-remaining');
    const remaining = remainingHeader === null ? null : Number(remainingHeader);
    const rateLimited = response.status === 403 || response.status === 429;
    const reason = rateLimited && remaining === 0 ? 'rate limit exceeded' : response.statusText;
    throw new GithubApiError(`GET ${path} failed: ${response.status} ${reason}`, response.status, remaining);
  }

  return (await response.json()) as T;
}

function normalizeRelease(release: ApiRelease | null): GithubRelease | null {
  if (!release || release.draft) return null;
  return {
    tag: release.tag_name,
    name: release.name,
    url: release.html_url,
    publishedAt: release.published_at,
  };
}

function normalizeRepo(repo: ApiRepo, latestRelease: GithubRelease | null): GithubRepo {
  return {
    name: repo.name,
    url: repo.html_url,
    description: repo.description,
    homepage: repo.homepage || null,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    language: repo.language,
    license: repo.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION' ? repo.license.spdx_id : null,
    pushedAt: repo.pushed_at,
    defaultBranch: repo.default_branch,
    archived: repo.archived,
    latestRelease,
  };
}

/**
 * Fetches every public repository of an organization plus its latest release.
 * Throws when the repository list itself cannot be fetched; a failing release
 * request only degrades that repo (previous snapshot value, then null).
 */
export async function fetchOrgSnapshot(org: string, options: FetchOptions = {}): Promise<GithubSnapshot> {
  const warn = options.onWarning ?? (() => {});
  const repos: ApiRepo[] = [];

  for (let page = 1; page <= 10; page += 1) {
    const batch = await apiGet<ApiRepo[]>(
      `/orgs/${encodeURIComponent(org)}/repos?type=public&per_page=100&page=${page}`,
      options,
    );
    if (!batch) throw new GithubApiError(`Organization "${org}" not found`, 404, null);
    repos.push(...batch);
    if (batch.length < 100) break;
  }

  const normalized = await Promise.all(
    repos
      .filter((repo) => !repo.fork)
      .map(async (repo) => {
        let release: GithubRelease | null = null;
        try {
          release = normalizeRelease(
            await apiGet<ApiRelease>(`/repos/${encodeURIComponent(org)}/${encodeURIComponent(repo.name)}/releases/latest`, options),
          );
        } catch (error) {
          const fallback = options.previous?.repos.find((r) => r.name === repo.name)?.latestRelease ?? null;
          warn(
            `Latest release of ${org}/${repo.name} unavailable (${error instanceof Error ? error.message : String(error)}). ` +
              (fallback ? `Keeping ${fallback.tag} from the snapshot.` : 'Showing no release.'),
          );
          release = fallback;
        }
        return normalizeRepo(repo, release);
      }),
  );

  normalized.sort((a, b) => a.name.localeCompare(b.name));

  return { org, fetchedAt: new Date().toISOString(), repos: normalized };
}
