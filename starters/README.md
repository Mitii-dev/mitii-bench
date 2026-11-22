# Starters (blank projects)

```text
starters/
  js/
    react-js/
    next-js/
    node/
    nest-js/
    ts-lib/
  python/             # reserved
```

Cases under `cases/{ecosystem}/…` set `starter:` to one of these folders.

| Starter (js) | Stack |
|---|---|
| `react-js` | Vite + React |
| `next-js` | Next.js App Router |
| `node` | Express + SQLite |
| `nest-js` | NestJS |
| `ts-lib` | Small TS package |

Install deps:

```bash
pnpm starters:install
```
