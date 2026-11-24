# ElasticSearch / Meilisearch Sync Pipeline

## Goal

Build a database hook or change-stream listener utility that synchronizes inserts/updates/deletes instantly to a search index engine.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-search-index-sync
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
