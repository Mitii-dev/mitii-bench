# File Storage Abstraction Layer (S3 vs Local)

## Goal

Build a storage driver abstraction interface with two implementations: `LocalStorageProvider` and `S3StorageProvider` sharing a common interface (`upload`, `delete`, `getUrl`).

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-storage-abstraction
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
