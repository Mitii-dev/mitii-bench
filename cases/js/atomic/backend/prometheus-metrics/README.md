# Metrics Exporter for Prometheus

## Goal

Build an Express metrics collection middleware using `prom-client`.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

- `prom-client`

```bash
pnpm case:dry-run backend-prometheus-metrics
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
