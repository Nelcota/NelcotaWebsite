<p align="center">
  <img src="public/favicon.png" width="72" height="72" alt="">
</p>

<h1 align="center">Nelcota website</h1>

<p align="center">
  The website and documentation of <a href="https://github.com/Nelcota/Nelcota">Nelcota</a>, the open-source Rust backend for PostgreSQL.
</p>

<p align="center">
  <a href="https://github.com/Nelcota/NelcotaWebsite/actions/workflows/ci.yml"><img src="https://github.com/Nelcota/NelcotaWebsite/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/Lighthouse-100-0f7a3d" alt="Lighthouse 100">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-111213" alt="Apache-2.0"></a>
</p>

---

- **Home, comparison and docs** in English (`/`) and Portuguese (`/pt-br/`).
- **Docs synced** from canonical Markdown in `Nelcota/Nelcota`, with current guides, an immutable v0.5.0 snapshot, pinned source links and search per version.
- **Published site:** [Nelcota documentation](https://nelcota.github.io/NelcotaWebsite/docs/).
- **Static and fast:** Astro, Tailwind CSS 4, under 4 KiB of client JavaScript on the home page, GSAP only after the first interaction, strict CSP, no third-party requests.

## Quick start

Requires Node.js 26 and pnpm 12.

```sh
pnpm install
pnpm dev        # http://localhost:4321
```

| Command | What it does |
| --- | --- |
| `pnpm build` / `pnpm preview` | Static build in `dist/` and a local server for it |
| `pnpm lint` / `pnpm check` | Biome and type checks |
| `pnpm test:unit` / `pnpm test` | Unit tests and Playwright tests (after a build) |
| `pnpm sizes` / `pnpm lhci` | Size budgets and Lighthouse CI |
| `pnpm docs:sync` | Pull the latest guides from `Nelcota/Nelcota` |

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for how the content, docs, motion, budgets and deploys work.

## License

[Apache-2.0](LICENSE). Fonts, logos and the mascot keep their own licenses, listed below.

<details>
<summary>Third-party assets</summary>

Fonts: Manrope and JetBrains Mono under the SIL Open Font License (`src/assets/fonts/LICENSE-*.txt`). Mascot: © Nelcota. Brand logos (`src/lib/brand-logos.ts`): Rust, PostgreSQL, Docker, TypeScript, Google, GitHub, Ubuntu and curl from Simple Icons 15.0.0 (CC0; the Rust logo is CC-BY-SA 4.0 by the Rust Foundation); Tux, Apple and Windows from gilbarbara/logos (CC0); Caddy from Simple Icons (CC0); the tokio mark from tokio-rs/website (MIT) and the pgBackRest armchair from pgbackrest/pgbackrest (MIT). The rustls crab (`src/assets/logos/rustls.png`) is from rustls/rustls `admin/logo`, licensed CC BY-NC 4.0. axum has no official logo, so it is shown by name. They are trademarks of their owners.

</details>
