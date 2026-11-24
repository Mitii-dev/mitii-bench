# Environment Config with Envalid / Zod

## Goal

Build a startup configuration validator parsing `process.env`.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

- `zod`

```bash
pnpm case:dry-run backend-env-config-validator
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
