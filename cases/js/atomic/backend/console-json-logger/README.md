# Console Object Redirection

## Goal

Build a custom logging wrapper redirecting standard outputs (`process.stdout`, `process.stderr`).

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-console-json-logger
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
