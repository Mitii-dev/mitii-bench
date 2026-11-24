# File Compression & Zip Archiver Service

## Goal

Build an endpoint that streams multiple server files into a single ZIP file download using `archiver`.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

- `archiver`

```bash
pnpm case:dry-run backend-zip-download-stream
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
