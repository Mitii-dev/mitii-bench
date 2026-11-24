# GraphQL Query Depth & Complexity Limiter

## Goal

Build a security middleware for a GraphQL endpoint that analyzes query AST depth and rejects queries exceeding depth/complexity limits to prevent DoS attacks.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-graphql-complexity-limit
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
