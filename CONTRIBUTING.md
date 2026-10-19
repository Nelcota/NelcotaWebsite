# Contributing to the Nelcota website

Thanks for helping. The organization-wide [code of conduct](https://github.com/Nelcota/.github/blob/main/CODE_OF_CONDUCT.md), [security policy](https://github.com/Nelcota/.github/blob/main/SECURITY.md) and [general contributing guide](https://github.com/Nelcota/.github/blob/main/CONTRIBUTING.md) apply here too. This file covers what is specific to the website.

## Workflow

1. Branch from `main` (`feat/…`, `fix/…`, `docs/…`).
2. Keep commits small and use [Conventional Commits](https://www.conventionalcommits.org/) (`feat(home): …`, `fix(docs): …`).
3. Run `pnpm lint && pnpm check && pnpm test:unit`, then `pnpm build && pnpm test` before opening a pull request. CI runs the full `pnpm test:ci`.
4. Every visible text change goes into both dictionaries (`src/i18n/en.ts` and `src/i18n/pt-br.ts`). Claims must be traceable to the Nelcota repository.

## Stack

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 26 (`.nvmrc`, `engines`) | Runs the TypeScript scripts directly (type stripping) |
| pnpm | 12.14.0 (`packageManager`) | |
| Astro | 7.4.0 | `output: 'static'`, native i18n routing, Fonts API, Content Layer, CSP |
| Tailwind CSS | 4.3.3 (`@tailwindcss/vite`) | CSS-first config in `src/styles/global.css` (`@theme`), no `tailwind.config.js` |
| TypeScript | 6.0.3 | `strict` + `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| Biome | 2.5.15 | Lint + format, full `.astro` support enabled |
| Playwright | 1.64.1 | Smoke tests against the production build |
| Lighthouse CI | 0.15.1 | Mobile audit of `/` and `/pt-br/` with budgets |
| shiki | 4.5.0 | Build-time highlighting emitted as classes (no inline styles, CSP-safe) |
| satori + @resvg/resvg-js | 0.62.0 + 2.6.2 | Open Graph images rendered at build time |
| sharp | 0.35.5 | Image service (AVIF/WebP + raster icons from the mascot) |
| @astrojs/sitemap | 3.7.4 | `sitemap-index.xml` with hreflang alternates |
| subset-font, @fontsource(-variable) | 2.9.0, 5.3.0 | Dev-only: regenerate the self-hosted font files |

All versions are pinned exactly in `package.json`.

## Run it

```sh
pnpm install
pnpm dev            # http://localhost:4321
pnpm build          # static output in dist/
pnpm preview        # serve dist/
```

Quality gates (the same ones CI runs):

```sh
pnpm lint           # Biome (lint + format check); `pnpm lint:fix` applies fixes
pnpm check          # astro check (types)
pnpm test           # Playwright smoke tests (needs `pnpm build` first; `pnpm exec playwright install chromium` once)
pnpm sizes          # gzip size budgets: JS <= 5 KB, CSS <= 20 KB per page
pnpm lhci           # Lighthouse CI against dist/ (set CHROME_PATH if Chrome is not on PATH)
pnpm docs:check     # vendor/nelcota-docs/ matches the commit in source.json
pnpm test:unit      # docs renderer and translation contract (node:test)
pnpm test:ci        # docs:check + test:unit + build + test + sizes + lhci
```

Optional environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `GITHUB_TOKEN` | Raises the GitHub API rate limit for the loader and `pnpm snapshot`. Works without it (60 requests/hour). |
| `SITE_URL` | Public origin, used for canonical URLs, sitemap, OG image URLs. Default `https://nelcota.github.io`. |
| `BASE_PATH` | Base path for project-page deployments (`/repo/`). Default `/`. |

## How the content works

- All page text lives in `src/i18n/en.ts` and `src/i18n/pt-br.ts`; both must satisfy the `Dictionary` interface in `src/i18n/types.ts`, so a missing key fails `pnpm check`. Dictionaries hold text only; every link into the Nelcota repository is defined once in `DOCS` in `src/lib/site.ts`.
- Code examples (quickstart steps, SDK snippets) are in `src/lib/snippets.ts`; they follow `docs/quickstart.md` and the SDK READMEs and are highlighted at build time (`src/lib/highlight.ts`) into CSP-safe classes. When the documented flow changes, update them together.
- `src/lib/github-loader.ts` is a Content Layer loader with one entry: the `Nelcota/Nelcota` repository and its recent releases (`src/lib/github.ts`). API responses and the snapshot are validated by the schemas in `src/lib/github-schema.ts`. The docs' release note and the JSON-LD use it. If the API fails or is rate limited, the build does **not** break: it uses `src/data/github-snapshot.json` and logs a warning. The footer shows the data date.
- Panel screenshots in `src/assets/screens/` come from the repository's `docs/assets/` (light and dark).
- Brand logos (`src/lib/brand-logos.ts`, one-color or multicolor) and line icons (`src/lib/icons.ts`) are built into one sprite file by `src/lib/sprite.ts`, served at a content-hashed URL (`/sprite-<hash>.svg`, cached for a year by the Caddyfile); `BrandLogo`, `Icon` and `Mark` reference it with `<use>`.
- When the project changes (new capability, removed limitation, new measurement, new release), update the dictionaries: the performance figures (`why.speed`, from `docs/goals/execution-report.md`), the security list (`why.safety`, from `docs/security/README.md`), the home copy in the `landing` block and the version-specific notes are editorial.
- The comparison page (`/compare/`, `/pt-br/compare/`, `ComparePage.astro`) reads `src/data/compare.ts`: self-hosted Supabase, PocketBase and self-hosted Appwrite, each cell checked against the official docs listed as sources on `CHECKED_ON`. When a project ships or drops a feature, edit the cell, the version and the date together. Keep it fair: self-hosted against self-hosted, each project in its own terms, Nelcota's gaps stated as plainly as its strengths, competitor names in text only (no logos).

### Documentation area (`/docs`, `/pt-br/docs`)

The guides are the Markdown files of the Nelcota repository, rendered into static pages at build time. Nothing is rewritten by hand on this side.

- **Which files:** `src/lib/docs/manifest.ts` lists every page (repository path, sidebar group, Portuguese catalog). Page ids match the admin panel's guide ids.
- **Sync:** `pnpm docs:sync` copies those files from one commit of `Nelcota/Nelcota` into `vendor/nelcota-docs/` and writes `vendor/nelcota-docs/source.json` (commit, commit date, SHA-256 per file). Builds read only this committed copy, so they never need the network and the same commit always gives the same pages. `pnpm docs:check` (run in CI and before deploys) fails if a file was edited locally or the manifest and the copy disagree.

  ```sh
  pnpm docs:sync                     # latest main, from GitHub (GITHUB_TOKEN optional)
  pnpm docs:sync --ref v0.5.0        # a branch, tag or commit
  pnpm docs:sync --from ../Nelcota --ref origin/main   # from a local clone, no network
  ```

  `.github/workflows/docs-sync.yml` runs the sync daily, on demand or on a `docs-updated` dispatch from the Nelcota repository, and opens a pull request when anything changed. The sync also prints which pages lack Portuguese text.
- **Portuguese:** pages use the repository's own catalogs (`docs/i18n/pt-BR/*.json`, the ones the admin panel uses) with the same contract as the panel (`src/lib/docs/translate.ts`): catalog keys are exact prose fragments, while code blocks, inline code, links and section anchors always come from the English source. Section anchors are the English slugs in both languages, so `#section` links match GitHub and the panel. A page without a catalog is shown in English with a notice and `lang="en"`; guides written only in Portuguese carry a notice on the English site.
- **Rendering:** `src/lib/docs/render.ts` (`marked`, pinned to the panel's version) escapes raw HTML, allows only http(s)/mailto/anchor links, turns links between published files into `/docs` links and everything else into GitHub links, and highlights code at build time into CSP-safe classes with a copy button. Links to sections that do not exist are reported during the build.
- **Search:** `src/pages/docs/search.json.ts` writes a static index per locale (about 90 KB gzip), fetched only when the search box gets focus (`src/scripts/docs-search.ts`). Press `/` or Ctrl/⌘+K.
- **Styles:** docs-only CSS lives in `src/styles/docs.css`, loaded by docs pages only. `global.css` does not scan `src/components/docs/`, so the home page carries none of it. Utilities used only by docs components must be written there as named classes.
- `pnpm test:unit` covers the renderer and the translation contract; `tests/docs.spec.ts` covers pages, search, copy and the phone layout.

### Refresh the GitHub snapshot

```sh
GITHUB_TOKEN=... pnpm snapshot   # token optional
```

Writes `src/data/github-snapshot.json`. Commit it. The daily deploy workflow fetches live data anyway; the snapshot only matters when the API is unavailable.

### Motion (GSAP)

The home page sections are in `src/components/home/` (`Home*.astro`, plus the shared `Eyebrow` and two-tone `Title`); `src/components/story/` keeps `Words` (heading words) and `DriftRow` (drifting tiles). The hero animates with CSS only, so nothing runs before the first paint. Scroll effects use GSAP + ScrollTrigger (`src/scripts/motion/index.ts`), opted into with data attributes (`data-words`, `data-fade`, `data-stagger`, `data-count-to`, `data-manifesto`, `data-panel-frame`, `data-cascade`). `src/scripts/motion/loader.ts` imports GSAP only on the first scroll, touch, click or key press, and never with reduced motion. Every animated element is complete in the HTML: without the script the page simply shows it, and effects only touch blocks still below the fold. `pnpm sizes` reports this on-demand chunk in its own column (budget 48 KiB gzip).

### Fonts

Manrope (variable, 400–700, headings and body, the same family as tela.nelcota.com) and JetBrains Mono (400, code) are self-hosted from `src/assets/fonts/` through Astro's Fonts API (`astro.config.ts`). Manrope is preloaded. `pnpm subset-fonts` regenerates the files from the Fontsource packages (Latin subset plus the marks the copy uses, weight axis trimmed); the `unicode-range` list in `astro.config.ts` must match `EXTRA_MARKS` in that script.

## Deploy

### GitHub Pages (default)

`.github/workflows/deploy.yml` builds and deploys on every push to `main`, daily at 05:17 UTC (keeps the releases fresh), on `workflow_dispatch`, and on `repository_dispatch` with `event_type: release-published`. To rebuild from another repository's release workflow:

```sh
gh api repos/Nelcota/<this-repo>/dispatches -f event_type=release-published
```

Enable Pages with "GitHub Actions" as the source. `actions/configure-pages` feeds `SITE_URL` and `BASE_PATH` to the build, so user sites, project sites and custom domains all work.

### Caddy on a VPS

`deploy/Caddyfile` serves `dist/` with zstd+gzip, immutable caching for `/_astro/*` and security headers. The strict CSP lives in each page's `<meta http-equiv>` tag, generated by Astro with a hash for every inline script and style; the Caddy header only adds what a `<meta>` policy cannot carry (`frame-ancestors`, `upgrade-insecure-requests`). Never repeat `script-src` or `style-src` in the header: browsers enforce both policies.

```sh
SITE_URL=https://your-domain.example pnpm build
rsync -a --delete dist/ user@vps:/srv/nelcota-site/
caddy run --config deploy/Caddyfile
```

## Performance and accessibility

Measured with Lighthouse 12.6 (mobile, simulated slow 4G) on the production build, 2026-10-18:

| Page | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 100 | 100 | 1.1 s | 1.8 s | 0 ms | 0 |
| `/pt-br/` | 100 | 100 | 100 | 100 | 1.1 s | 1.8 s | 0 ms | 0 |

Home page: 3.6 KiB of client JavaScript and 17.3 KiB of CSS (gzip, imported chunks included), plus 43.7 KiB of GSAP loaded only after the first interaction, logos and icons in one content-hashed sprite, no third parties. The LCP element is the hero subtitle, so the paint waits for the preloaded Manrope file after the document (caps: LCP 2.0 s, FCP 1.4 s, performance ≥ 0.98). CI fails if the budgets in `lighthouserc.cjs`, `budgets.json` or `scripts/sizes.ts` are exceeded.

Client JavaScript (`src/scripts/`): the theme bootstrap (inline, before paint), the theme toggle (`aria-pressed`), tabs (APG keyboard pattern), carousels (scroll-snap with arrows and a progress bar), copy buttons, the phone menu (Escape and outside click close it), the sticky phone call to action, the pause button for moving decorations, the GSAP scroll effects (loaded on first interaction) and the docs search and table of contents. Without JS or with `prefers-reduced-motion`, everything is static and complete. Dark mode uses `light-dark()` tokens.

## Project layout

```
src/
  assets/            mascot.png, mascot/, fonts/, screens/ (panel screenshots, light + dark)
  components/        Home (page assembly), ComparePage (+ CompareTable, CompareWins, compare-strings.ts);
                     chrome: Header, Footer, Seo, ThemeToggle; building blocks: CodeBlock, CopyButton, CopyScript,
                     Screenshot, Mark, Icon, BrandLogo, BrandMark, Mascot
  components/home/   the home sections (HomeHero … HomeDuo) and their Eyebrow and Title
  components/story/  Words (heading words for the scroll effect), DriftRow (drifting tiles)
  components/docs/   the /docs area
  content.config.ts  GitHub loader collection
  data/              github-snapshot.json, compare.ts (comparison table and its sources)
  i18n/              en.ts, pt-br.ts, types.ts, utils.ts
  layouts/           Base.astro
  lib/               site.ts (links), sprite.ts, snippets.ts, highlight.ts, syntax-theme.ts, figures.ts, icons.ts, brand-logos.ts,
                     github.ts, github-schema.ts, github-loader.ts, repo.ts, docs/
  pages/             index.astro, pt-br/, docs/, compare/, 404.astro, og/[lang].png.ts, sprite-[version].svg.ts,
                     manifest.webmanifest.ts, robots.txt.ts
  scripts/           theme-init.js (inline, CSP-hashed) and the browser modules listed above
  styles/            global.css (Tailwind + @theme tokens), docs.css
scripts/             snapshot.ts, subset-fonts.ts, sizes.ts, sync-docs.ts
tests/               smoke.spec.ts, docs.spec.ts, compare.spec.ts, unit/ (node --test)
deploy/              Caddyfile
.github/workflows/   ci.yml, deploy.yml, docs-sync.yml
```

