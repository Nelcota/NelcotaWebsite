/**
 * GitHub data access shared by the build-time content loader and `pnpm snapshot`.
 * Node-only, no Astro virtual modules, so the snapshot script can run with plain `node`.
 */
import type { z } from 'astro/zod';
import {
  type ApiRelease,
  type ApiRepo,
  apiReleaseListSchema,
  apiRepoSchema,
  type GithubRelease,
  type GithubSnapshot,
} from './github-schema.ts';

/** How many published releases the site keeps and shows, newest first. */
export const RELEASES_SHOWN = 5;

/** Releases requested per call; extra room because drafts and prereleases are dropped. */
export const RELEASES_FETCHED = 20;

/** Per-request timeout in milliseconds. */
export const REQUEST_TIMEOUT_MS = 10_000;

export const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_API_VERSION = '2022-11-28';
const USER_AGENT = 'nelcota-website-build';

const HTTP_NOT_FOUND = 404;
const HTTP_FORBIDDEN = 403;
const HTTP_TOO_MANY_REQUESTS = 429;

/** GitHub reports this when it cannot identify the license. */
const UNKNOWN_LICENSE = 'NOASSERTION';

export class GithubApiError extends Error {
  readonly status: number;
  readonly rateLimitRemaining: number | null;

  constructor(
    message: string,
    status: number,
    rateLimitRemaining: number | null,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'GithubApiError';
    this.status = status;
    this.rateLimitRemaining = rateLimitRemaining;
  }
}

/** The API answered 2xx, but the body does not match the expected schema. */
export class GithubResponseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'GithubResponseError';
  }
}

export interface FetchOptions {
  readonly token?: string | undefined;
  /** Previous snapshot used to keep the releases when only that request fails. */
  readonly previous?: GithubSnapshot | undefined;
  readonly onWarning?: ((message: string) => void) | undefined;
  /** Per-request timeout in milliseconds. */
  readonly timeoutMs?: number | undefined;
  readonly apiBase?: string | undefined;
  /** How many releases to keep. */
  readonly releaseCount?: number | undefined;
}

const NETWORK_ERROR_NAMES: ReadonlySet<string> = new Set(['TimeoutError', 'AbortError']);

/**
 * True for failures caused by GitHub or the network (HTTP errors, unexpected
 * bodies, timeouts, connection errors), which callers may recover from.
 * Anything else is a bug and should propagate.
 */
export function isGithubUnavailable(error: unknown): boolean {
  if (error instanceof GithubApiError) return true;
  if (error instanceof GithubResponseError) return true;
  if (!(error instanceof Error)) return false;

  if (NETWORK_ERROR_NAMES.has(error.name)) return true;

  // fetch() rejects with TypeError("fetch failed") on DNS/connection errors;
  // any other TypeError is a bug in this file and must not hide behind the snapshot.
  return error instanceof TypeError && error.message === 'fetch failed';
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function requestHeaders(token: string | undefined): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
    'User-Agent': USER_AGENT,
  };
  if (token == null || token.length === 0) return headers;

  return { ...headers, Authorization: `Bearer ${token}` };
}

function rateLimitRemaining(response: Response): number | null {
  const header = response.headers.get('x-ratelimit-remaining');
  if (header == null) return null;

  const remaining = Number.parseInt(header, 10);
  return Number.isFinite(remaining) ? remaining : null;
}

function failure(path: string, response: Response): GithubApiError {
  const remaining = rateLimitRemaining(response);
  const rateLimited =
    response.status === HTTP_FORBIDDEN || response.status === HTTP_TOO_MANY_REQUESTS;
  const reason = rateLimited && remaining === 0 ? 'rate limit exceeded' : response.statusText;
  return new GithubApiError(
    `GET ${path} failed: ${response.status} ${reason}`,
    response.status,
    remaining,
  );
}

/** GET + schema validation. Resolves to null on 404. */
async function apiGet<Schema extends z.ZodType>(
  path: string,
  schema: Schema,
  options: FetchOptions,
): Promise<z.infer<Schema> | null> {
  const response = await fetch(`${options.apiBase ?? GITHUB_API_BASE}${path}`, {
    headers: requestHeaders(options.token),
    signal: AbortSignal.timeout(options.timeoutMs ?? REQUEST_TIMEOUT_MS),
  });

  if (response.status === HTTP_NOT_FOUND) return null;
  if (!response.ok) throw failure(path, response);

  let body: unknown;
  try {
    body = await response.json();
  } catch (error: unknown) {
    // A proxy or an outage page answering 200 with HTML: recoverable, like any bad body.
    throw new GithubResponseError(`GET ${path} returned invalid JSON`, { cause: error });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw new GithubResponseError(`GET ${path} returned an unexpected body`, {
      cause: result.error,
    });
  }

  return result.data;
}

/** Newest publication first; unpublished ones last; tag name breaks ties so the order is stable. */
function byPublishedDesc(a: ApiRelease, b: ApiRelease): number {
  if (a.published_at === b.published_at) return a.tag_name.localeCompare(b.tag_name);
  if (a.published_at == null) return 1;
  if (b.published_at == null) return -1;

  return Date.parse(b.published_at) - Date.parse(a.published_at);
}

function normalizeReleases(releases: readonly ApiRelease[], count: number): GithubRelease[] {
  // GitHub lists releases by creation date; the site treats the first one as the latest published.
  return releases
    .filter((release) => !release.draft && !release.prerelease)
    .toSorted(byPublishedDesc)
    .slice(0, count)
    .map((release) => ({
      tag: release.tag_name,
      name: release.name,
      url: release.html_url,
      publishedAt: release.published_at,
    }));
}

function normalizeLicense(license: ApiRepo['license']): string | null {
  const spdx = license?.spdx_id;
  if (spdx == null) return null;
  if (spdx.length === 0 || spdx === UNKNOWN_LICENSE) return null;

  return spdx;
}

function normalizeHomepage(homepage: string | null): string | null {
  if (homepage == null) return null;

  return homepage.trim().length === 0 ? null : homepage;
}

async function fetchReleases(
  fullName: string,
  options: FetchOptions,
): Promise<readonly GithubRelease[]> {
  const count = options.releaseCount ?? RELEASES_SHOWN;

  try {
    const list = await apiGet(
      `/repos/${fullName}/releases?per_page=${RELEASES_FETCHED}`,
      apiReleaseListSchema,
      options,
    );
    return normalizeReleases(list ?? [], count);
  } catch (error) {
    if (!isGithubUnavailable(error)) throw error;

    const releases = (options.previous?.repo.releases ?? []).slice(0, count);
    const fallback = releases.length > 0 ? 'Keeping the snapshot releases.' : 'Showing no release.';
    options.onWarning?.(
      `Releases of ${fullName} unavailable (${errorMessage(error)}). ${fallback}`,
    );
    return releases;
  }
}

/**
 * Fetches one repository plus its recent releases. Throws when the repository
 * itself cannot be fetched; a failing release request keeps the previous
 * snapshot's releases (or none) and warns.
 */
export async function fetchRepoSnapshot(
  fullName: string,
  options: FetchOptions = {},
): Promise<GithubSnapshot> {
  // Independent requests: a slow API costs one timeout, not two.
  const [repo, releases] = await Promise.all([
    apiGet(`/repos/${fullName}`, apiRepoSchema, options),
    fetchReleases(fullName, options),
  ]);
  if (repo == null) {
    throw new GithubApiError(`Repository "${fullName}" not found`, HTTP_NOT_FOUND, null);
  }

  return {
    fetchedAt: new Date().toISOString(),
    repo: {
      fullName: repo.full_name,
      url: repo.html_url,
      description: repo.description,
      homepage: normalizeHomepage(repo.homepage),
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      language: repo.language,
      license: normalizeLicense(repo.license),
      pushedAt: repo.pushed_at,
      defaultBranch: repo.default_branch,
      topics: repo.topics ?? [],
      releases,
    },
  };
}
