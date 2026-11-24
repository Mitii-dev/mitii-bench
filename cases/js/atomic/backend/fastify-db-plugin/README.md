# Fastify Plugin Architecture

## Goal

Build a Fastify custom plugin using `fastify-plugin`.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

- `fastify`
- `fastify-plugin`

```bash
pnpm case:dry-run backend-fastify-db-plugin
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
