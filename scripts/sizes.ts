/**
 * Reports gzip sizes of the client JavaScript and CSS actually shipped per page
 * (inline and external) and fails when the budgets are exceeded:
 * JS <= 5 KB gzip, CSS <= 20 KB gzip. Run after `pnpm build` (`pnpm sizes`).
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = new URL('../dist/', import.meta.url).pathname;
const BUDGET = { js: 5 * 1024, css: 20 * 1024 } as const;

const gz = (data: string | Buffer) => gzipSync(data, { level: 9 }).length;
const kb = (bytes: number) => `${(bytes / 1024).toFixed(2)} KB`;

async function htmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files.sort();
}

async function external(html: string, pattern: RegExp): Promise<{ raw: number; gz: number }> {
  let raw = 0;
  let gzip = 0;
  for (const match of html.matchAll(pattern)) {
    const url = match[1];
    if (!url?.startsWith('/')) continue;
    const file = join(DIST, url);
    try {
      const data = await readFile(file);
      raw += (await stat(file)).size;
      gzip += gz(data);
    } catch {
      /* not a local file */
    }
  }
  return { raw, gz: gzip };
}

let failed = false;
console.log(
  `${'page'.padEnd(22)} ${'JS raw'.padStart(9)} ${'JS gzip'.padStart(9)} ${'CSS raw'.padStart(9)} ${'CSS gzip'.padStart(9)}`,
);
for (const file of await htmlFiles(DIST)) {
  const html = await readFile(file, 'utf8');
  const inlineJs = [
    ...html.matchAll(/<script\b(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g),
  ]
    .map((m) => m[1] ?? '')
    .join('\n');
  const inlineCss = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1] ?? '')
    .join('\n');
  const extJs = await external(html, /<script\b[^>]*\bsrc="([^"]+)"/g);
  const extCss = await external(html, /<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g);

  const js = { raw: Buffer.byteLength(inlineJs) + extJs.raw, gz: gz(inlineJs) + extJs.gz };
  const css = { raw: Buffer.byteLength(inlineCss) + extCss.raw, gz: gz(inlineCss) + extCss.gz };
  const name = relative(DIST, file);
  const over = js.gz > BUDGET.js || css.gz > BUDGET.css;
  failed ||= over;
  console.log(
    `${name.padEnd(22)} ${kb(js.raw).padStart(9)} ${kb(js.gz).padStart(9)} ${kb(css.raw).padStart(9)} ${kb(css.gz).padStart(9)}${over ? '  OVER BUDGET' : ''}`,
  );
}
console.log(`budgets: JS <= ${kb(BUDGET.js)} gzip, CSS <= ${kb(BUDGET.css)} gzip`);
if (failed) {
  console.error('Size budget exceeded.');
  process.exit(1);
}
