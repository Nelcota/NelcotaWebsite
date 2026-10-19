/**
 * Reports gzip sizes of the client JavaScript and CSS actually shipped per page
 * (inline and external) and fails when the budgets are exceeded:
 * JS <= 5 KiB gzip, CSS <= 20 KiB gzip. Run after `pnpm build` (`pnpm sizes`).
 * Scripts count with the chunks they import, and a referenced file missing
 * from dist/ fails the run instead of counting as zero. Chunks loaded later
 * with a dynamic import() (the scroll animations, fetched on first scroll)
 * are reported in their own column with their own budget: they never block
 * the first paint, but they still cost the visitor bytes.
 */
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, posix, relative } from 'node:path';
import { promisify } from 'node:util';
import { gzip as gzipCallback } from 'node:zlib';

const gzip = promisify(gzipCallback);

const DIST = new URL('../dist/', import.meta.url).pathname;
const BYTES_PER_KB = 1024;
const BUDGET = { js: 5 * BYTES_PER_KB, css: 20 * BYTES_PER_KB, lazyJs: 48 * BYTES_PER_KB } as const;
const GZIP_LEVEL = 9;
const NAME_COLUMN = 22;
const SIZE_COLUMN = 9;

const INLINE_SCRIPT = /<script\b(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g;
const INLINE_STYLE = /<style\b[^>]*>([\s\S]*?)<\/style>/g;
const EXTERNAL_SCRIPT = /<script\b[^>]*\bsrc="([^"]+)"/g;
const EXTERNAL_STYLE = /<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g;
/** Static imports inside a built module: `import"./x.js"` or `from"./x.js"`. */
const MODULE_IMPORT = /(?:import|from)\s*["'](\.{1,2}\/[^"']+)["']/g;
/** Dynamic imports, loaded on demand: `import("./x.js")` or `import("/_astro/x.js")`, any quote. */
const DYNAMIC_IMPORT = /import\(\s*["'`]((?:\.{1,2})?\/[^"'`]+)["'`]\s*\)/g;
/** Site base path (BASE_PATH at build time), stripped before looking a URL up in dist/. */
const BASE = (process.env.BASE_PATH ?? '/').replace(/\/?$/, '/');

const missing: string[] = [];

interface Size {
  readonly raw: number;
  readonly gz: number;
}

const gzSize = async (data: string | Buffer): Promise<number> =>
  (await gzip(data, { level: GZIP_LEVEL })).length;
const kb = (bytes: number): string => `${(bytes / BYTES_PER_KB).toFixed(2)} KiB`;

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

async function htmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await htmlFiles(full)));
      continue;
    }
    if (entry.name.endsWith('.html')) files.push(full);
  }
  return files.sort();
}

/** Bytes of a file under dist/, or null when the URL is not a built file. */
async function readDistFile(url: string): Promise<Buffer | null> {
  try {
    return await readFile(join(DIST, url));
  } catch (error) {
    if (isMissingFile(error)) return null;
    throw error;
  }
}

/** dist/-relative path of a same-site URL: query string and base path removed. */
function distPath(url: string): string {
  const path = url.split(/[?#]/)[0] ?? url;
  if (path.startsWith(BASE)) return `/${path.slice(BASE.length)}`;

  return path;
}

/** What one page ships: files already counted, and chunks it loads later with import(). */
interface Walk {
  readonly seen: Set<string>;
  readonly lazy: Set<string>;
}

/** dist/ path of an import specifier: absolute (`/_astro/x.js`) or relative to the importing file. */
function resolveImport(specifier: string, from: string): string {
  if (specifier.startsWith('/')) return distPath(specifier);

  return posix.join(dirname(from), specifier);
}

/** Records every dynamic import() in a piece of code as an on-demand chunk of the page. */
function noteLazyImports(code: string, from: string, walk: Walk): void {
  for (const match of code.matchAll(DYNAMIC_IMPORT)) {
    const specifier = match[1];
    if (specifier != null) walk.lazy.add(resolveImport(specifier, from));
  }
}

/** The file plus, for JavaScript, every chunk it imports statically (each counted once). */
async function collect(path: string, walk: Walk): Promise<Size> {
  const { seen } = walk;
  if (seen.has(path)) return { raw: 0, gz: 0 };
  seen.add(path);

  const data = await readDistFile(path);
  if (data == null) {
    missing.push(path);

    return { raw: 0, gz: 0 };
  }

  let size: Size = { raw: data.length, gz: await gzSize(data) };
  if (!path.endsWith('.js')) return size;

  const code = data.toString('utf8');
  noteLazyImports(code, path, walk);

  for (const match of code.matchAll(MODULE_IMPORT)) {
    const specifier = match[1];
    if (specifier == null) continue;

    size = add(size, await collect(resolveImport(specifier, path), walk));
  }

  return size;
}

async function external(html: string, pattern: RegExp, walk: Walk): Promise<Size> {
  let total: Size = { raw: 0, gz: 0 };

  for (const match of html.matchAll(pattern)) {
    const url = match[1];
    if (url == null || !url.startsWith('/')) continue;

    total = add(total, await collect(distPath(url), walk));
  }

  return total;
}

async function inline(html: string, pattern: RegExp, walk: Walk): Promise<Size> {
  const code = [...html.matchAll(pattern)].map((match) => match[1] ?? '').join('\n');
  noteLazyImports(code, '/', walk);

  return { raw: Buffer.byteLength(code), gz: await gzSize(code) };
}

/** On-demand chunks, without anything the page already loads up front. */
async function lazySize(walk: Walk): Promise<Size> {
  const lazyWalk: Walk = { seen: new Set(walk.seen), lazy: new Set() };
  let total: Size = { raw: 0, gz: 0 };
  for (const chunk of walk.lazy) total = add(total, await collect(chunk, lazyWalk));

  return total;
}

const add = (a: Size, b: Size): Size => ({ raw: a.raw + b.raw, gz: a.gz + b.gz });

const row = (cells: readonly string[]): string => {
  const [name = '', ...sizes] = cells;
  return [name.padEnd(NAME_COLUMN), ...sizes.map((cell) => cell.padStart(SIZE_COLUMN))].join(' ');
};

let failed = false;
console.log(row(['page', 'JS raw', 'JS gzip', 'CSS raw', 'CSS gzip', 'lazy JS gz']));

for (const file of await htmlFiles(DIST)) {
  const html = await readFile(file, 'utf8');
  const scripts: Walk = { seen: new Set(), lazy: new Set() };
  const styles: Walk = { seen: new Set(), lazy: new Set() };
  const js = add(
    await inline(html, INLINE_SCRIPT, scripts),
    await external(html, EXTERNAL_SCRIPT, scripts),
  );
  const css = add(
    await inline(html, INLINE_STYLE, styles),
    await external(html, EXTERNAL_STYLE, styles),
  );
  const lazy = await lazySize(scripts);
  const over = js.gz > BUDGET.js || css.gz > BUDGET.css || lazy.gz > BUDGET.lazyJs;
  if (over) failed = true;

  const line = row([
    relative(DIST, file),
    kb(js.raw),
    kb(js.gz),
    kb(css.raw),
    kb(css.gz),
    kb(lazy.gz),
  ]);
  console.log(over ? `${line}  OVER BUDGET` : line);
}

console.log(
  `budgets: JS <= ${kb(BUDGET.js)} gzip, CSS <= ${kb(BUDGET.css)} gzip, on-demand JS <= ${kb(BUDGET.lazyJs)} gzip`,
);
if (missing.length > 0) {
  console.error(`Referenced but not built: ${[...new Set(missing)].join(', ')}`);
  failed = true;
}

if (failed) {
  console.error('Size budget exceeded or files missing.');
  process.exitCode = 1;
}
