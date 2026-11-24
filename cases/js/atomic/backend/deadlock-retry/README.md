# Database Deadlock Retry Handler

## Goal

Build a database execution wrapper that detects SQL deadlock/serialization failure error codes (e.g., Postgres code `40001` or `40P01`) and retries query execution up to 3 times with jittered delays.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-deadlock-retry
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
