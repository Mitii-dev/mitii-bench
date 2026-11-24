# Node.js Test Runner (Native `node:test`)

## Goal

Build an automated test file using Node's built-in test runner (`node:test` and `node:assert`).

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-native-test-truncate
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
