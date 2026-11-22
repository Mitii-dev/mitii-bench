# Checks (`@mitii-bench/checks`)

Checks are pluggable validators. Authors declare them under `checks:` in `task.yaml`. The runner compiles them and executes each against the workspace.

## Built-in check types

| YAML key | Meaning |
|---|---|
| `build: true` | Run `npm run build` |
| `test: { command }` | Run a test command (UI or API) |
| `browser: { command }` | Run a browser test command (e.g. Playwright) |
| `contains: { file, text }` | File must include text |
| `notContains: { file, text }` | File must not include text |
| `exists: { file }` | File must exist |
| `command: { run }` | Arbitrary shell command |
| `http: { start, requests }` | Start server + assert HTTP |
| `sqlite_query: { … }` | Query SQLite |
| `package_deps: […]` | Required packages in package.json |
| `workspace_changed` | Workspace must differ from starter |

## Examples

```yaml
checks:
  - build: true
  - test:
      command: "npm test -- tests/ui.test.jsx"
      timeoutMs: 60000
  - browser:
      command: "npx playwright test tests/browser.spec.js"
      timeoutMs: 120000
  - http:
      start:
        command: "node src/index.js"
      timeoutMs: 15000
      requests:
        - method: GET
          path: /health
          expect:
            status: 200
```

## Adding a new check type

1. Extend `CheckItemSchema` in [`packages/schema/src/task.js`](../packages/schema/src/task.js).
2. Teach `compileChecks` in [`packages/checks/src/compile.js`](../packages/checks/src/compile.js) to emit an internal check object.
3. Implement execution in [`packages/checks/src/verify.js`](../packages/checks/src/verify.js) (or `registerCheck(type, handler)`).
4. Document it here.
5. Add a compile unit test under `packages/checks/test/`.

Old cases keep working — new types are opt-in per `task.yaml`.

## Hidden tests folder

Case-local `tests/` is copied into the workspace **only at check time** (after the agent finishes / after dry-run applies `solution/`). Prefer:

- Frontend: `tests/ui.test.jsx`
- Backend: `tests/api.test.js`
