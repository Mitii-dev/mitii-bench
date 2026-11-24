# Worker Threads for Heavy Computation

## Goal

Build an API endpoint offloading CPU-bound tasks to worker threads (`worker_threads`).

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

_None beyond the starter._

```bash
pnpm case:dry-run backend-worker-fibonacci
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
