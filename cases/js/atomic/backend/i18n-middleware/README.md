# Multi-Language i18n Translation Middleware

## Goal

Build an internationalization middleware parsing `Accept-Language` headers and injecting locale translation helper `req.__('key')`.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-i18n-middleware
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
