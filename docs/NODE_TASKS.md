# Node backend tasks corpus (`references/node-tasks.md`)

Source prompts live in gitignored `references/node-tasks.md` (100 items).  
Generator: `pnpm generate:node-backend` → `scripts/generate-node-backend-cases.mjs`  
Data:

- `scripts/data/node-core-cases.mjs` (1–25)
- `scripts/data/node-ecosystem-cases.mjs` (26–55)
- `scripts/data/node-realworld-cases.mjs` + `node-realworld-solutions.mjs` (56–100)

## Applicability

| Prompt range | Topic | Starter | Notes |
|---|---|---|---|
| 1–25 | Node core & async | `node` | Vanilla; solutions + `tests/api.test.js`; HTTP where needed |
| 26–43, 48–55 | Express / Prisma / Socket / … | `node` | `package_deps` + solutions |
| 44–47 | NestJS | `nest-js` | TypeScript solutions + HTTP |
| 56–100 | Real-world backend | `node` | Vanilla or `ecosystem-lib` |

## Check layers

1. `contains` / `exists`
2. `package_deps` when `packages:` is non-empty
3. `test:` — agent-hidden `node --test tests/api.test.js`
4. `http:` — start server and assert payloads

See [CHECKS.md](./CHECKS.md).

## Tags

- `vanilla` / `ecosystem-lib` / `smoke` / `node-tasks`

## Commands

```bash
pnpm generate:node-backend --force
pnpm case:validate
pnpm --filter @mitii-bench/runner bench --dryRun --tag=smoke
pnpm case:dry-run backend-http-native-server
```
