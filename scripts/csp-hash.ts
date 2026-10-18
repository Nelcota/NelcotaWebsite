/**
 * Prints the CSP hash of the inline theme bootstrap script (src/scripts/theme-init.js).
 * Astro adds it to the <meta http-equiv="content-security-policy"> automatically;
 * paste the printed value into deploy/Caddyfile after changing that script.
 */
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/scripts/theme-init.js', import.meta.url), 'utf8');
console.log(`'sha256-${createHash('sha256').update(source).digest('base64')}'`);
