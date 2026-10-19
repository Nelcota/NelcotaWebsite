/**
 * Copies the documentation the /docs area is built from (src/lib/docs/manifest.ts)
 * out of the Nelcota repository at one commit, into vendor/nelcota-docs/, and
 * records that commit and a SHA-256 per file in vendor/nelcota-docs/source.json.
 * The site builds only from the committed copy, so a build never depends on
 * the network and the same commit always produces the same files.
 *
 *   pnpm docs:sync                       # latest commit of main, from GitHub
 *   pnpm docs:sync --ref v0.5.0          # a branch, tag or commit SHA
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
import { type DocsLock, isCommitSha, lockSchema } from '../src/lib/docs/lock.ts';
import { catalogPath, DOC_PAGES, type DocPage, requiredFiles } from '../src/lib/docs/manifest.ts';
import { checkCatalog, parseCatalog } from '../src/lib/docs/translate.ts';
import { readGithubToken } from '../src/lib/github-schema.ts';
import { REPO } from '../src/lib/site.ts';

const execFile = promisify(execFileCallback);

const VENDOR_DIR = new URL('../vendor/nelcota-docs/', import.meta.url).pathname;
const LOCK_FILE = join(VENDOR_DIR, 'source.json');
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
async function readVendored(path: string): Promise<Buffer | null> {
  try {
    return await readFile(join(VENDOR_DIR, path));
  } catch (error) {
    if (isMissingFile(error)) return null;
    throw error;
  }
}

const sha256 = (data: Buffer): string => createHash('sha256').update(data).digest('hex');

async function readLock(): Promise<DocsLock> {
  return lockSchema.parse(JSON.parse(await readFile(LOCK_FILE, 'utf8')));
}

async function sync(source: DocsSource, ref: string): Promise<void> {
  const { commit, committedAt } = await source.resolve(ref);
  // Checked before anything is deleted: a bad date would only surface at the next build.
  if (!lockSchema.shape.committedAt.safeParse(committedAt).success) {
    throw new SyncError(
      `"${ref}" resolved to ${commit} with an unreadable commit date "${committedAt}"`,
    );
  }
  const paths = requiredFiles();
  const contents = await Promise.all(paths.map((path) => source.read(commit, path)));

  // Start from an empty folder so files dropped from the manifest disappear.
  await rm(VENDOR_DIR, { recursive: true, force: true });
  const files: Record<string, string> = {};
  for (const [index, path] of paths.entries()) {
    const data = contents[index];
    if (data == null) throw new SyncError(`No content for ${path}`);

    await mkdir(dirname(join(VENDOR_DIR, path)), { recursive: true });
    await writeFile(join(VENDOR_DIR, path), data);
    files[path] = sha256(data);
  }

  const lock: DocsLock = lockSchema.parse({ repository: REPO, ref, commit, committedAt, files });
  await writeFile(LOCK_FILE, `${JSON.stringify(lock, null, JSON_INDENT)}\n`);
  console.log(`Synced ${paths.length} files from ${REPO}@${commit.slice(0, 12)} (${ref}).`);
  await reportTranslations();
}

async function check(): Promise<void> {
  const lock = await readLock();
  const expected = requiredFiles();
  const problems: string[] = [];

  for (const path of expected) {
    const hash = lock.files[path];
    if (hash == null) {
      problems.push(`${path}: in the manifest but not synced (run pnpm docs:sync)`);
      continue;
    }
    const data = await readVendored(path);
    if (data == null) {
      problems.push(`${path}: missing from vendor/nelcota-docs/`);
      continue;
    }
    if (sha256(data) !== hash)
      problems.push(`${path}: edited locally (hash differs from source.json)`);
  }
  for (const path of Object.keys(lock.files)) {
    if (!expected.includes(path)) problems.push(`${path}: synced but no longer in the manifest`);
  }

  if (problems.length > 0) {
    throw new SyncError(`vendor/nelcota-docs/ is out of date:\n  ${problems.join('\n  ')}`);
  }
  console.log(`vendor/nelcota-docs/ matches ${lock.repository}@${lock.commit.slice(0, 12)}.`);
  await reportTranslations();
}

/** Portuguese coverage per page; gaps are listed for review, they do not fail. */
async function reportTranslations(): Promise<void> {
  const lines: string[] = [];
  for (const page of DOC_PAGES as readonly DocPage[]) {
    if (page.language != null) continue;
    if (page.catalog == null) {
      lines.push(`  ${page.id}: no Portuguese catalog (shown in English)`);
      continue;
    }
    const markdown = await readFile(join(VENDOR_DIR, page.source), 'utf8');
    const path = catalogPath(page.catalog);
    const catalog = parseCatalog(await readFile(join(VENDOR_DIR, path), 'utf8'), path);
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
    ref: { type: 'string', default: 'main' },
    from: { type: 'string' },
  },
});

async function main(): Promise<void> {
  if (values.check) return check();

  if (values.ref.trim().length === 0) throw new SyncError('--ref cannot be empty');
  if (values.from != null && values.from.trim().length === 0)
    throw new SyncError('--from cannot be empty');

  const source = values.from == null ? githubSource(readGithubToken()) : gitSource(values.from);

  return sync(source, values.ref);
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
