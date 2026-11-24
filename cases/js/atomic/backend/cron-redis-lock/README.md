# Scheduled Cron Jobs with Locks

## Goal

Build a task scheduler using `node-cron`.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

- `node-cron`
- `redlock`
- `ioredis`

```bash
pnpm case:dry-run backend-cron-redis-lock
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
