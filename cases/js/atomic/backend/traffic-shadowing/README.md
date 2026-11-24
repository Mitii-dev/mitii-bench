# HTTP Request Mirroring / Traffic Shadowing

## Goal

Build a middleware that duplicates incoming production requests asynchronously to a staging environment endpoint without impacting primary response latency.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-traffic-shadowing
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
