# Roadmap

## Now

- **Releitura test: request X-ray section.** Port only the X-ray from the lab page (`src/pages/releitura.astro`) into the official design system, still on a `noindex` test page. The home does not change.

## Next

- Decide whether the X-ray joins the home, and in which position.
- Review the rest of the releitura (boot intro, big numbers, security, panel, steps) with the same audit.

## Decisions

| Date | Decision |
|---|---|
| 2026-11-01 | Scope of the first releitura stage: only one section (the X-ray) in the official design system, on a test page. |
| 2026-11-01 | Reference: heydamir/unslop order — audit, propose a direction, wait for approval, then edit. |
| 2026-11-01 | The releitura lives on its own branch (`feat/releitura`) and worktree, with a commit of the lab page before any change. |
