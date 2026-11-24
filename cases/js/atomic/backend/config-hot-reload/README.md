# Dynamic Config Reloading without Restart

## Goal

Build a configuration provider that watches a `config.json` file on disk for changes and hot-reloads configuration settings in memory without restarting the Node server.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-config-hot-reload
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
