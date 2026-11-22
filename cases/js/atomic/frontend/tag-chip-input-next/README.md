# Tag Input / Chip Creator Field

## Goal

Build a chip creator input field.

## Ecosystem

`js` — matrix on React (Vite) and Next.js App Router.

## Bases

| Base | Approach |
|---|---|
| `base-react-js` | Client UI in `src/App.jsx` |
| `base-next-js` | Client page in `app/page.jsx` (`"use client"`) |

```bash
pnpm case:dry-run frontend-tag-chip-input-next
pnpm case:dry-run frontend-tag-chip-input-next@base-react-js
```

## How we grade

- Shared: `npm run build`
- Shared: Vitest + Testing Library `test:` (behavioral; agent-hidden under `tests/`)
- Per-base: `data-testid` / marker asserts in source
- `solution/` is dry-run only

Source: `references/react-tasks.md` (vanilla React — no extra packages).
