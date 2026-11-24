# Automatic Database Reconnection Strategy

## Goal

Build a resilient database connection manager wrapper handling connection drops with exponential backoff and retry limits.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-db-reconnect-backoff
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
