# PDF Report Generator Service

## Goal

Build a PDF generation endpoint rendering HTML templates to PDF buffers using `puppeteer` or `pdfkit`.

## Starter

`node` — Node.js starter — implement under `src/`.

## Packages

- `pdfkit`

```bash
pnpm case:dry-run backend-pdf-invoice-report
```

## How we check

- Recipes in `task.yaml` under `checks:`
- Hidden automated tests in `tests/` (injected only at check time)
- `solution/` is dry-run only (never shown to the agent)
