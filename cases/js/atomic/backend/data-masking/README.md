# Data Masking & Anonymization Engine

## Goal

Build a log/export sanitizer module that recurses through objects and masks sensitive keys (`ssn`, `creditCard`, `password`) with `

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-data-masking
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
