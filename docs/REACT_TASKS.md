# React tasks corpus (`references/react-tasks.md`)

Source prompts live in gitignored `references/react-tasks.md` (100 items).  
Generator: `pnpm generate:react-frontend` → `scripts/generate-react-frontend-cases.mjs`  
Data: `scripts/data/react-{core,realworld,library}-cases.mjs`

## Applicability

| Prompt range | Topic | React case | Next case | Notes |
|---|---|---|---|---|
| 1–25 | React core | `{slug}-react` | `{slug}-next` | Vanilla |
| 26–30, 32 | UI libs | Scaffold | No | `ecosystem-lib` |
| 31 | React Native Paper | Skipped | Skipped | Not a web starter |
| 33–36 | React Router | Scaffold | Parallel `next-*` cases | |
| 37–55 | Redux/Zustand/Query/… | Scaffold | No | Agent installs packages |
| 56–99 | Real-world widgets | `{slug}-react` | `{slug}-next` | Vanilla |
| 100 | Site shell | `site-nav-pages-react` | `site-nav-pages-next` | |

## Tags

- `vanilla` — no extra packages; dry-run solutions shipped
- `ecosystem-lib` — third-party packages; scaffold only
- `smoke` — CI dry-run subset
- `react-tasks` — from the reference bank

## Check strength

1. `contains` / `exists` — structural contracts
2. `build: true`
3. `test:` — Vitest + Testing Library under `tests/`

See [CHECKS.md](./CHECKS.md).

## Commands

```bash
pnpm generate:react-frontend --force
pnpm generate:react-frontend --vanilla-only
pnpm case:validate
pnpm --filter @mitii-bench/runner bench --dryRun --tag=smoke
pnpm case:dry-run frontend-counter-state-react
pnpm cases --tag=vanilla --family=frontend
```
