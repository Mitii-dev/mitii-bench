# Soft Delete Engine

## Goal

Build an abstraction layer or ORM plugin automatically transforming `delete` commands into soft updates (`deleted_at = NOW()`) and filtering them out of standard `find` queries.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-soft-delete-engine
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
