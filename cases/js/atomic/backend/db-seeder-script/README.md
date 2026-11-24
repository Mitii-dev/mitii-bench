# DB Schema Seeder Script

## Goal

Build a robust database seeding CLI script supporting deterministic random generation (e.g., using `@faker-js/faker`) with configurable item counts and foreign key wiring.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

- `@faker-js/faker`

```bash
pnpm case:dry-run backend-db-seeder-script
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
