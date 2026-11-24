# Sliding Window IP Banning System

## Goal

Build a security guard middleware that temporarily bans IPs triggering >10 `401 Unauthorized` responses within a 5-minute window.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-ip-ban-sliding-window
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
