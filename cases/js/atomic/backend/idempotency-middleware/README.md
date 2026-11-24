# Distributed Idempotency Key Middleware

## Goal

Build an API idempotency engine using Redis.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

- `ioredis`

```bash
pnpm case:dry-run backend-idempotency-middleware
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
