# Module System Interop (CJS & ESM)

## Goal

Build a dual-package entry point utility library supporting both CommonJS (`require`) and ES Modules (`import`).

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-dual-package-exports
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
