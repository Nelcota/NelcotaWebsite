# Nelcota website

Static site for the [Nelcota](https://github.com/Nelcota) GitHub organization: who we are, the projects and how to start using them. Built with Astro, zero UI frameworks and about 0.8 KB of client JavaScript.

- English at `/`, Portuguese (Brazil) at `/pt-br/`
- GitHub stars, releases and "updated X ago" fetched at build time, with an offline snapshot fallback
- Lighthouse 100/100/100/100 (mobile) on both locales, CLS 0, strict CSP, no third-party requests

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
pnpm test:ci        # build + test + sizes + lhci
```

Optional environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `GITHUB_TOKEN` | Raises the GitHub API rate limit for the loader and `pnpm snapshot`. Works without it (60 requests/hour). |
| `SITE_URL` | Public origin, used for canonical URLs, sitemap, OG image URLs. Default `https://nelcota.github.io`. |
| `BASE_PATH` | Base path for project-page deployments (`/repo/`). Default `/`. |

## How the content works

- `src/content/projects/*.md` is the editorial collection: one file per project with name, repo, tier, stack, license, status and descriptions in both languages (validated by the schema in `src/content.config.ts`).
- `src/lib/github-loader.ts` is a custom Content Layer loader. At build time it fetches every public repository of the org and its latest release (`src/lib/github.ts`). If the API fails or is rate limited, the build does **not** break: it uses `src/data/github-snapshot.json` and logs a warning. The footer shows the data date and whether it came from the snapshot.
- `src/lib/projects.ts` merges both collections by repository name. A project without a public repository (currently `NelcotaDeploy`) still renders, with "Repository not public yet" instead of stars.
- UI strings live in `src/i18n/en.ts` and `src/i18n/pt-br.ts`; both must satisfy the `Dictionary` interface in `src/i18n/types.ts`, so a missing key fails `pnpm check`.

### Add a project

1. Create `src/content/projects/<slug>.md` with the frontmatter used by the existing files (`name`, `repo`, `url`, `tier`, `order`, `status`, `license`, `language`, `stack`, `description.en`, `description.pt-br`, optional `links`).
2. `repo` must match the GitHub repository name so stars and releases are merged automatically.
3. Run `pnpm snapshot` so the offline fallback knows the repository too, then `pnpm build`.

### Refresh the GitHub snapshot

```sh
GITHUB_TOKEN=... pnpm snapshot   # token optional
```

Writes `src/data/github-snapshot.json`. Commit it. The daily deploy workflow fetches live data anyway; the snapshot only matters when the API is unavailable.

### Fonts

Inter (variable, 400–700) and JetBrains Mono (400) are self-hosted from `src/assets/fonts/` through Astro's Fonts API (`astro.config.ts`). Only the hero font (Inter) is preloaded. `pnpm subset-fonts` regenerates the files from the Fontsource packages (Latin subset, weight axis trimmed), which roughly halves them.

## Deploy

### GitHub Pages (default)

`.github/workflows/deploy.yml` builds and deploys on every push to `main`, daily at 05:17 UTC (keeps stars and releases fresh), on `workflow_dispatch`, and on `repository_dispatch` with `event_type: release-published`. To rebuild from another repository's release workflow:

```sh
gh api repos/Nelcota/<this-repo>/dispatches -f event_type=release-published
```

Enable Pages with "GitHub Actions" as the source. `actions/configure-pages` feeds `SITE_URL` and `BASE_PATH` to the build, so user sites, project sites and custom domains all work.

### Caddy on a VPS

`deploy/Caddyfile` serves `dist/` with zstd+gzip, immutable caching for `/_astro/*`, security headers and a strict CSP. The CSP allows the inline theme script by hash; after editing `src/scripts/theme-init.js` run `pnpm csp-hash` and update the Caddyfile.

```sh
pnpm build
rsync -a --delete dist/ user@vps:/srv/nelcota-site/
caddy run --config deploy/Caddyfile
```

## Performance and accessibility

Measured with Lighthouse 12.6 (mobile, simulated slow 4G) on the production build:

| Page | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 100 | 100 | 0.9 s | 1.5 s | 0 ms | 0 |
| `/pt-br/` | 100 | 100 | 100 | 100 | 0.9 s | 1.5 s | 0 ms | 0 |

Per page: 0.76 KB of client JavaScript and 6.5 KB of CSS (gzip), both inlined; 6 requests, 69 KB transferred, no third parties. CI fails if the budgets in `lighthouserc.cjs`, `budgets.json` or `scripts/sizes.ts` are exceeded.

Client JavaScript: the theme bootstrap (inline, before paint), the theme toggle, and the tabs + copy button in "Build with Nelcota". Everything else is HTML and CSS; dark mode uses `light-dark()` tokens and animations respect `prefers-reduced-motion`.

## Project layout

```
src/
  assets/            mascot.png, fonts/
  components/        Header, Hero, Projects, ProjectCard, CodeTabs, CopyButton, ThemeToggle, Why, Contribute, Footer, Seo, Icon, Mascot, Home
  content/projects/  nelcota.md, screenshare.md, deploy.md, prompts.md
  content.config.ts  collections + GitHub loader
  data/              github-snapshot.json
  i18n/              en.ts, pt-br.ts, types.ts, utils.ts
  layouts/           Base.astro
  lib/               github.ts, github-loader.ts, projects.ts, highlight.ts, snippets.ts, site.ts
  pages/             index.astro, pt-br/index.astro, 404.astro, og/[lang].png.ts, manifest.webmanifest.ts, robots.txt.ts
  scripts/           theme-init.js (inline, CSP-hashed)
  styles/            global.css (Tailwind + @theme)
scripts/             snapshot.ts, subset-fonts.ts, sizes.ts, csp-hash.ts
tests/               smoke.spec.ts
deploy/              Caddyfile
.github/workflows/   ci.yml, deploy.yml
```

## Licenses

Site code: see the organization's repositories for their licenses (Apache-2.0 / MIT). Fonts: Inter and JetBrains Mono under the SIL Open Font License (`src/assets/fonts/LICENSE-*.txt`). Mascot: © Nelcota.
