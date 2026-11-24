# Request Payload Size Guard

## Goal

Build a streaming payload size validator middleware that aborts request connection immediately if streamed payload exceeds maximum byte threshold prior to loading full body.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-payload-size-guard
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
