# BullMQ Background Worker Queue

## Goal

Build a background email processing job queue using `bullmq` and Redis.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

- `bullmq`
- `ioredis`

```bash
pnpm case:dry-run backend-bullmq-email-queue
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
