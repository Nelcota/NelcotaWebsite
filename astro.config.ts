import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

/**
 * SITE_URL / BASE_PATH are injected by the GitHub Pages workflow
 * (actions/configure-pages) so the same build works on a user site,
 * a project site or a custom domain. Defaults match a user/org site.
 */
const DEFAULT_SITE_URL = 'https://nelcota.github.io';

/** An env var, with blank values treated as unset. */
function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  if (value == null || value.length === 0) return undefined;

  return value;
}

const siteUrl = env('SITE_URL') ?? DEFAULT_SITE_URL;
// Canonical, hreflang, sitemap and OG URLs all come from this: a VPS build without it would point at GitHub Pages.
if (env('SITE_URL') == null) console.warn(`[nelcota] SITE_URL is not set; canonical URLs use ${DEFAULT_SITE_URL}`);
new URL(siteUrl); // throws on a malformed SITE_URL instead of shipping broken links
const basePath = env('BASE_PATH') ?? '/';

/**
 * The theme bootstrap script is inlined in <head> before first paint.
 * Its SHA-256 is added to the CSP so the page can keep a strict policy
 * (no 'unsafe-inline').
 */
const themeInit = await readFile(new URL('./src/scripts/theme-init.js', import.meta.url), 'utf8');
const themeInitHash = `sha256-${createHash('sha256').update(themeInit).digest('base64')}` as const;

// Latin subset shipped with the fonts (Fontsource's range plus the marks in scripts/subset-fonts.ts).
const latin = [
  'U+0000-00FF',
  'U+0131',
  'U+0152-0153',
  'U+02BB-02BC',
  'U+02C6',
  'U+02DA',
  'U+02DC',
  'U+0304',
  'U+0308',
  'U+0329',
  'U+2000-206F',
  'U+20AC',
  'U+2122',
  'U+2190-2193',
  'U+21BA',
  'U+2248',
  'U+2264-2265',
  'U+2318',
  'U+2500',
  'U+2502',
  'U+2514',
  'U+251C',
  'U+25B6',
  'U+25CF',
  'U+276F',
  'U+2212',
  'U+2215',
  'U+FEFF',
  'U+FFFD',
] as const;

export default defineConfig({
  site: siteUrl,
  base: basePath,
  output: 'static',
  trailingSlash: 'ignore',
  compressHTML: true,
  build: {
    // One page, small CSS: inlining removes a render-blocking request.
    inlineStylesheets: 'always',
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt-br'],
    routing: { prefixDefaultLocale: false },
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Manrope',
      cssVariable: '--font-manrope',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          {
            // Variable font trimmed to the 400–700 range (see scripts/subset-fonts.ts).
            weight: '400 700',
            style: 'normal',
            src: ['./src/assets/fonts/manrope-latin-wght-normal.woff2'],
            display: 'swap',
            unicodeRange: [...latin],
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      fallbacks: ['monospace'],
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/jetbrains-mono-latin-400-normal.woff2'],
            display: 'swap',
            unicodeRange: [...latin],
          },
        ],
      },
    },
  ],
  image: {
    responsiveStyles: false,
  },
  markdown: {
    // No Markdown code blocks are rendered; code snippets use src/lib/highlight.ts (CSP-safe classes).
    syntaxHighlight: false,
  },
  security: {
    csp: {
      directives: [
        "default-src 'none'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "manifest-src 'self'",
        "base-uri 'none'",
        "form-action 'none'",
      ],
      scriptDirective: {
        resources: ["'self'"],
        hashes: [themeInitHash],
      },
      styleDirective: {
        resources: ["'self'"],
      },
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', 'pt-br': 'pt-BR' },
      },
      filter: (page) => !page.includes('/404'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
