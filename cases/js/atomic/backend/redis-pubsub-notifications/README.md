# Real-Time Distributed Notification System

## Goal

Build a multi-server event dispatcher using Redis Pub/Sub to sync notification alerts across connected client WebSockets across different Node server nodes.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

- `ioredis`
- `socket.io`

```bash
pnpm case:dry-run backend-redis-pubsub-notifications
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
