# Database Connection Pool Health Monitor

## Goal

Build a database monitoring loop that queries connection pool state (`activeConnections`, `idleConnections`, `queuedRequests`) and emits alerts if connection pool starvation occurs.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-db-pool-monitor
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
