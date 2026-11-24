# OAuth2 Refresh Token Revocation List

## Goal

Build a token blacklist mechanism backed by Redis.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

- `ioredis`

```bash
pnpm case:dry-run backend-token-revocation-list
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
