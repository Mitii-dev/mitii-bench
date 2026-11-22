# Authoring a case

One folder = one exam. Keep it simple.

## Checklist (5 things)

1. **Folder** under `cases/{ecosystem}/atomic/{category}/{slug}/`
2. **`task.yaml`** — id, title, `starter`, `checks`
3. **`prompt.md`** — what the agent reads
4. **`tests/`** (optional) — hidden automated tests injected only at check time
5. **`solution/`** — known-good files so `pnpm case:dry-run` proves checks work

## `task.yaml` skeleton

```yaml
id: frontend-my-widget-react
title: "My Widget"
ecosystem: js
starter: react-js          # react-js | next-js | node | nest-js | ts-lib
family: frontend
difficulty: easy
category: frontend
tags: [vanilla]
timeoutSec: 300
promptFile: prompt.md
checks:
  - build: true
  - test:
      command: "npm test -- tests/ui.test.jsx"
      timeoutMs: 60000
  - contains:
      file: src/App.jsx
      text: 'data-testid="my-widget"'
```

## Starters

| `starter` | Blank project |
|---|---|
| `react-js` | Vite + React |
| `next-js` | Next.js App Router |
| `node` | Node HTTP / Express-style |
| `nest-js` | NestJS |
| `ts-lib` | TypeScript library |

Use **separate folders** for React vs Next — do not put multiple starters in one `task.yaml`.

## Dry-run vs agent

| Mode | Command | Who edits? | Pass/fail |
|---|---|---|---|
| Dry-run | `pnpm case:dry-run <id>` | Apply `solution/` | Same `checks:` |
| Agent | `pnpm bench <id>` | Mitii | Same `checks:` |

Checks never diff against `solution/`. Agents never see `tests/` or `solution/` while coding.

## Commands

```bash
pnpm case:new --category=frontend --slug=my-widget-react --starter=react-js --yes
pnpm case:validate
pnpm case:dry-run frontend-my-widget-react
```

## Rules of precision

- Check what the prompt contracts (`data-testid`, behavior, HTTP shapes).
- Do not check solution wording or dummy copy.
- Prefer behavioral `test:` / `browser:` over brittle source-only checks when possible.

## Adding a new check type

See [CHECKS.md](./CHECKS.md).
