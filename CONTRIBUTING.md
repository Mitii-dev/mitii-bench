# Contributing

## Where cases live

```text
cases/{ecosystem}/atomic/{category}/{slug}/
  README.md      # required — explain the case
  prompt.md      # required — agent prompt
  task.yaml      # starter + checks
  tests/         # optional — hidden automated tests
  solution/      # dry-run known-good implementation
```

| Ecosystem | Folder | Starters |
|---|---|---|
| JavaScript/TS | `cases/js/` | `starters/js/{react-js,next-js,node,…}` |
| Python (later) | `cases/python/` | `starters/python/…` |

See [docs/AUTHORING.md](./docs/AUTHORING.md) and [docs/CHECKS.md](./docs/CHECKS.md).

## Catalog is auto-generated

Do not hand-edit `catalog/catalog.json` or `catalog/cases.html`. Rebuild with:

- `pnpm case:validate`
- `pnpm catalog`
- `pnpm install` (postinstall)

## Add a case

```bash
pnpm case:new --yes --ecosystem=js --category=frontend --slug=my-case-react \
  --starter=react-js \
  --prompt='…'
# edit prompt.md + README.md
# add solution/ and tests/
pnpm case:validate
pnpm case:dry-run <id>
```

## Filters

```bash
pnpm cases --ecosystem=js
pnpm cases --family=frontend
pnpm cases --starter=react-js
pnpm cases --tag=smoke
pnpm case:dry-run frontend-accessible-modal-react
```

## Bulk generators

```bash
pnpm generate:react-frontend --force
pnpm generate:node-backend --force
pnpm case:validate
pnpm --filter @mitii-bench/runner bench --dryRun --tag=smoke
```

## Mitii / CI

- Set `MITII_BIN` (or `runner.config.local.json`) — see [docs/RUNNING_MITII.md](./docs/RUNNING_MITII.md)
- PR CI: dry-run only (`.github/workflows/ci.yml`)
- Agent nightly example: `.github/workflows/agent-nightly.example.yml`
- Always `pnpm preflight` before paid agent runs
