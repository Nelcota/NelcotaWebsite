/**
 * Regenerates the self-hosted font files in src/assets/fonts from the Fontsource
 * packages (`pnpm subset-fonts`). The outputs are committed, so builds never
 * download fonts.
 *
 * - Inter variable: Latin subset, weight axis restricted to 400–700 (the only
 *   weights the site uses), which roughly halves the file.
 * - JetBrains Mono: static 400 instance, Latin subset (code blocks only).
 * - Inter 400/700 WOFF for the Open Graph renderer (satori does not read WOFF2).
 */
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import subsetFont from 'subset-font';

const require = createRequire(import.meta.url);
const out = new URL('../src/assets/fonts/', import.meta.url);
await mkdir(new URL('og/', out), { recursive: true });

const pkgFile = (pkg: string, file: string) => require.resolve(`${pkg}/files/${file}`);

/** Basic Latin, Latin-1 Supplement and the typographic marks used in the copy. */
let text = '';
for (let code = 0x20; code <= 0x7e; code += 1) text += String.fromCharCode(code);
for (let code = 0xa0; code <= 0xff; code += 1) text += String.fromCharCode(code);
text += '–—‘’“”…•→←€™�';

async function subset(
  source: string,
  target: string,
  options: Parameters<typeof subsetFont>[2] = {},
) {
  const input = await readFile(source);
  const output = await subsetFont(input, text, { targetFormat: 'woff2', ...options });
  await writeFile(new URL(target, out), output);
  console.log(
    `${target.padEnd(40)} ${String(input.length).padStart(7)} -> ${String(output.length).padStart(6)} bytes`,
  );
}

await subset(
  pkgFile('@fontsource-variable/inter', 'inter-latin-wght-normal.woff2'),
  'inter-latin-wght-normal.woff2',
  {
    variationAxes: { wght: { min: 400, max: 700 } },
  },
);
await subset(
  pkgFile('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff2'),
  'jetbrains-mono-latin-400-normal.woff2',
);

for (const weight of [400, 700]) {
  const file = `inter-latin-${weight}-normal.woff`;
  await copyFile(pkgFile('@fontsource/inter', file), new URL(`og/${file}`, out));
  console.log(`og/${file} copied`);
}
await copyFile(
  require.resolve('@fontsource-variable/inter/LICENSE'),
  new URL('LICENSE-Inter.txt', out),
);
await copyFile(
  require.resolve('@fontsource/jetbrains-mono/LICENSE'),
  new URL('LICENSE-JetBrainsMono.txt', out),
);
