/**
 * Regenerates the self-hosted font files in src/assets/fonts from the Fontsource
 * packages (`pnpm subset-fonts`). The outputs are committed, so builds never
 * download fonts.
 *
 * - Manrope variable: Latin subset, weight axis restricted to 400–700 (the only
 *   weights the site uses), the same family as tela.nelcota.com.
 * - JetBrains Mono: static 400 instance, Latin subset (code blocks only).
 * - Manrope 400/700 WOFF for the Open Graph renderer (satori does not read WOFF2).
 */
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import subsetFont from 'subset-font';

const require = createRequire(import.meta.url);
const out = new URL('../src/assets/fonts/', import.meta.url);
await mkdir(new URL('og/', out), { recursive: true });

const pkgFile = (pkg: string, file: string) => require.resolve(`${pkg}/files/${file}`);

/** Printable Basic Latin (space to tilde). */
const BASIC_LATIN = { first: 0x20, last: 0x7e } as const;
/** Latin-1 Supplement (no-break space to ÿ). */
const LATIN_1_SUPPLEMENT = { first: 0xa0, last: 0xff } as const;
/**
 * Marks used in the copy, the demos and the vendored docs, outside the ranges
 * above: arrows, ≈ ≤ ≥, ⌘, ● ❯ ▶ and the box-drawing lines of file trees.
 * Keep in sync with the unicode-range list in astro.config.ts.
 */
const EXTRA_MARKS = '–—‘’“”…•›←↑→↓↺€™≈≤≥⌘─│└├▶●❯�';

/** Manrope weight axis kept: the only weights the site uses. */
const MANROPE_WEIGHTS = { min: 400, max: 700 } as const;
/** Static Manrope weights for the Open Graph renderer. */
const OG_WEIGHTS = [400, 700] as const;

const LOG_NAME_COLUMN = 40;
const LOG_INPUT_COLUMN = 7;
const LOG_OUTPUT_COLUMN = 6;

function charRange({ first, last }: { readonly first: number; readonly last: number }): string {
  return Array.from({ length: last - first + 1 }, (_, offset) =>
    String.fromCharCode(first + offset),
  ).join('');
}

/** Basic Latin, Latin-1 Supplement and the typographic marks used in the copy. */
const text = `${charRange(BASIC_LATIN)}${charRange(LATIN_1_SUPPLEMENT)}${EXTRA_MARKS}`;

async function subset(
  source: string,
  target: string,
  options: Parameters<typeof subsetFont>[2] = {},
): Promise<void> {
  const input = await readFile(source);
  const output = await subsetFont(input, text, { targetFormat: 'woff2', ...options });
  await writeFile(new URL(target, out), output);
  console.log(
    `${target.padEnd(LOG_NAME_COLUMN)} ${String(input.length).padStart(LOG_INPUT_COLUMN)} -> ${String(output.length).padStart(LOG_OUTPUT_COLUMN)} bytes`,
  );
}

await subset(
  pkgFile('@fontsource-variable/manrope', 'manrope-latin-wght-normal.woff2'),
  'manrope-latin-wght-normal.woff2',
  {
    variationAxes: { wght: MANROPE_WEIGHTS },
  },
);
await subset(
  pkgFile('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff2'),
  'jetbrains-mono-latin-400-normal.woff2',
);

for (const weight of OG_WEIGHTS) {
  const file = `manrope-latin-${weight}-normal.woff`;
  await copyFile(pkgFile('@fontsource/manrope', file), new URL(`og/${file}`, out));
  console.log(`og/${file} copied`);
}
await copyFile(
  require.resolve('@fontsource-variable/manrope/LICENSE'),
  new URL('LICENSE-Manrope.txt', out),
);
await copyFile(
  require.resolve('@fontsource/jetbrains-mono/LICENSE'),
  new URL('LICENSE-JetBrainsMono.txt', out),
);
