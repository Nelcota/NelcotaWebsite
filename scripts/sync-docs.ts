/**
 * Copies the documentation the /docs area is built from (src/lib/docs/manifest.ts)
 * out of the Nelcota repository at one commit, into vendor/nelcota-docs/, and
 * records that commit and a SHA-256 per file in vendor/nelcota-docs/source.json.
 * The site builds only from the committed copy, so a build never depends on
 * the network and the same commit always produces the same files.
 *
 *   pnpm docs:sync                       # latest commit of main, from GitHub
 *   pnpm docs:sync --version v0.5.0      # immutable tagged release archive
 *   pnpm docs:sync --from ../Nelcota     # from a local clone (no network)
 *   pnpm docs:check                      # verify the committed copy (CI)
 *
 * Node 26 strips the types; no build step.
 */
import { execFile as execFileCallback } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { parseArgs, promisify } from 'node:util';
import { z } from 'astro/zod';
import { type DocsLock, isCommitSha, lockSchema, packageVersions } from '../src/lib/docs/lock.ts';
import { catalogPath, DOC_PAGES, type DocPage, requiredFiles } from '../src/lib/docs/manifest.ts';
import { checkCatalog, parseCatalog } from '../src/lib/docs/translate.ts';
import { DOC_VERSIONS, type DocsVersion, docsVersion } from '../src/lib/docs/versions.ts';
import { readGithubToken } from '../src/lib/github-schema.ts';
import { REPO } from '../src/lib/site.ts';

const execFile = promisify(execFileCallback);

function vendorDirectory(version: DocsVersion): string {
  return new URL(`../vendor/${docsVersion(version).directory}/`, import.meta.url).pathname;
}
const REQUEST_TIMEOUT_MS = 15_000;
const GIT_MAX_BUFFER = 16 * 1024 * 1024;
const JSON_INDENT = 2;

class SyncError extends Error {
  override readonly name = 'SyncError';
}

/** Where the files come from: GitHub over HTTPS or a local clone. */
interface DocsSource {
  resolve(ref: string): Promise<{ commit: string; committedAt: string }>;
  read(commit: string, path: string): Promise<Buffer>;
}

const commitResponseSchema = z.object({
  sha: z.string().refine(isCommitSha),
  commit: z.object({ committer: z.object({ date: z.iso.datetime({ offset: true }) }) }),
});

function githubSource(token: string | undefined): DocsSource {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (token != null) headers.Authorization = `Bearer ${token}`;

  const get = async (url: string, accept?: string): Promise<Response> => {
    const response = await fetch(url, {
      headers: accept == null ? headers : { ...headers, Accept: accept },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new SyncError(`GET ${url} answered ${response.status}`);

    return response;
  };

  return {
    async resolve(ref) {
      const url = `https://api.github.com/repos/${REPO}/commits/${encodeURIComponent(ref)}`;
      const body = commitResponseSchema.parse(await (await get(url)).json());

      return { commit: body.sha, committedAt: body.commit.committer.date };
    },
    async read(commit, path) {
      const url = `https://raw.githubusercontent.com/${REPO}/${commit}/${path}`;

      return Buffer.from(await (await get(url, '*/*')).arrayBuffer());
    },
  };
}

function gitSource(directory: string): DocsSource {
  const git = async (args: readonly string[]): Promise<Buffer> => {
    const { stdout } = await execFile('git', ['-C', directory, ...args], {
      encoding: 'buffer',
      maxBuffer: GIT_MAX_BUFFER,
    });

    return stdout;
  };

  return {
    async resolve(ref) {
      const output = await git(['show', '-s', '--format=%H %cI', `${ref}^{commit}`]);
      const [commit = '', committedAt = ''] = output.toString('utf8').trim().split(' ');
      if (!isCommitSha(commit)) throw new SyncError(`git could not resolve "${ref}"`);

      return { commit, committedAt };
    },
    read: (commit, path) => git(['show', `${commit}:${path}`]),
  };
}

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

/** The vendored file, or null when it is missing. Permission or disk errors surface as they are. */
async function readVendored(path: string, version: DocsVersion): Promise<Buffer | null> {
  try {
    return await readFile(join(vendorDirectory(version), path));
  } catch (error) {
    if (isMissingFile(error)) return null;
    throw error;
  }
}

const sha256 = (data: Buffer): string => createHash('sha256').update(data).digest('hex');

async function readLock(version: DocsVersion): Promise<DocsLock> {
  return lockSchema.parse(
    JSON.parse(await readFile(join(vendorDirectory(version), 'source.json'), 'utf8')),
  );
}

async function sync(source: DocsSource, ref: string, version: DocsVersion): Promise<void> {
  const definition = docsVersion(version);
  if (version !== 'current' && ref !== definition.ref) {
    throw new SyncError(`Release snapshot ${version} requires ref ${definition.ref}`);
  }
  const directory = vendorDirectory(version);
  let previous: DocsLock | null = null;
  if (version !== 'current') {
    try {
      previous = await readLock(version);
    } catch (error) {
      if (!isMissingFile(error)) throw error;
    }
  }
  const { commit, committedAt } = await source.resolve(ref);
  if (previous != null && previous.commit !== commit) {
    throw new SyncError(
      `Refusing to replace ${version}: ${previous.commit} differs from ${commit}`,
    );
  }
  // Checked before anything is deleted: a bad date would only surface at the next build.
  if (!lockSchema.shape.committedAt.safeParse(committedAt).success) {
    throw new SyncError(
      `"${ref}" resolved to ${commit} with an unreadable commit date "${committedAt}"`,
    );
  }
  const pages = previous?.pages ?? DOC_PAGES;
  const paths = requiredFiles(pages);
  const contents = await Promise.all(paths.map((path) => source.read(commit, path)));
  const sourceFiles = new Map(paths.map((path, index) => [path, contents[index]]));
  const versions = packageVersions((path) => {
    const value = sourceFiles.get(path);
    if (value == null) throw new SyncError(`Missing version metadata: ${path}`);
    return value.toString('utf8');
  });

  // Start from an empty folder so files dropped from the manifest disappear.
  await rm(directory, { recursive: true, force: true });
  const files: Record<string, string> = {};
  for (const [index, path] of paths.entries()) {
    const data = contents[index];
    if (data == null) throw new SyncError(`No content for ${path}`);

    await mkdir(dirname(join(directory, path)), { recursive: true });
    await writeFile(join(directory, path), data);
    files[path] = sha256(data);
  }

  const lock: DocsLock = lockSchema.parse({
    repository: REPO,
    ref,
    commit,
    committedAt,
    pages,
    versions,
    files,
  });
  await writeFile(join(directory, 'source.json'), `${JSON.stringify(lock, null, JSON_INDENT)}\n`);
  console.log(`Synced ${paths.length} files from ${REPO}@${commit.slice(0, 12)} (${ref}).`);
  await reportTranslations(version);
}

async function check(version: DocsVersion): Promise<void> {
  const lock = await readLock(version);
  const expected = requiredFiles(lock.pages);
  const problems: string[] = [];
  const contentsForVersions = new Map<string, Buffer>();
  const identity = (page: DocPage): string =>
    JSON.stringify([page.id, page.group, page.source, page.catalog, page.language]);
  if (
    version === 'current' &&
    lock.pages.map(identity).join('\n') !== DOC_PAGES.map(identity).join('\n')
  ) {
    problems.push('Current page manifest changed (run pnpm docs:sync)');
  }
  if (version !== 'current' && lock.ref !== docsVersion(version).ref) {
    problems.push(`Release snapshot ${version} has a different ref`);
  }

  for (const path of expected) {
    const hash = lock.files[path];
    if (hash == null) {
      problems.push(`${path}: in the manifest but not synced (run pnpm docs:sync)`);
      continue;
    }
    const data = await readVendored(path, version);
    if (data == null) {
      problems.push(`${path}: missing from vendor/nelcota-docs/`);
      continue;
    }
    contentsForVersions.set(path, data);
    if (sha256(data) !== hash)
      problems.push(`${path}: edited locally (hash differs from source.json)`);
  }
  for (const path of Object.keys(lock.files)) {
    if (!expected.includes(path)) problems.push(`${path}: synced but no longer in the manifest`);
  }

  const actualVersions = packageVersions((path) => {
    // Metadata files are checked against their recorded hashes above as well.
    const data = contentsForVersions.get(path);
    if (data == null) throw new SyncError(`Missing version metadata: ${path}`);
    return data.toString('utf8');
  });
  if (JSON.stringify(actualVersions) !== JSON.stringify(lock.versions))
    problems.push('Package version labels differ from the source manifests');
  if (problems.length > 0) {
    throw new SyncError(`vendor/nelcota-docs/ is out of date:\n  ${problems.join('\n  ')}`);
  }
  console.log(`vendor/nelcota-docs/ matches ${lock.repository}@${lock.commit.slice(0, 12)}.`);
  await reportTranslations(version);
}

/** Portuguese coverage per page; gaps are listed for review, they do not fail. */
async function reportTranslations(version: DocsVersion): Promise<void> {
  const lines: string[] = [];
  const directory = vendorDirectory(version);
  const lock = await readLock(version);
  for (const page of lock.pages) {
    if (page.language != null) continue;
    if (page.catalog == null) {
      lines.push(`  ${page.id}: no Portuguese catalog (shown in English)`);
      continue;
    }
    const markdown = await readFile(join(directory, page.source), 'utf8');
    const path = catalogPath(page.catalog);
    const catalog = parseCatalog(await readFile(join(directory, path), 'utf8'), path);
    const report = checkCatalog(markdown, catalog);
    const gaps = report.missing.length + report.changed.length;
    if (gaps === 0) continue;

    lines.push(
      `  ${page.id}: ${report.missing.length} missing, ${report.changed.length} with changed code/links`,
    );
  }

  if (lines.length === 0) {
    console.log('Portuguese: every page is fully translated.');
    return;
  }
  console.log(`Portuguese gaps (English text is shown in their place):\n${lines.join('\n')}`);
}

const { values } = parseArgs({
  options: {
    check: { type: 'boolean', default: false },
    ref: { type: 'string' },
    version: { type: 'string', default: 'current' },
    from: { type: 'string' },
  },
});

async function main(): Promise<void> {
  if (values.check) {
    for (const version of DOC_VERSIONS) await check(version.id);
    return;
  }
  const version = docsVersion(values.version);
  const ref = values.ref ?? version.ref;
  if (ref.trim().length === 0) throw new SyncError('--ref cannot be empty');
  if (values.from != null && values.from.trim().length === 0)
    throw new SyncError('--from cannot be empty');

  const source = values.from == null ? githubSource(readGithubToken()) : gitSource(values.from);

  return sync(source, ref, version.id);
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
