# Mitii Bench Checks

A practical guide to declaring, running, and extending graders for Mitii Bench cases.

Checks live under `checks:` in each case’s `task.yaml`. The runner compiles them into internal objects, runs them against the agent workspace, and prints a per-check pass/fail report.

---

## Table of contents

1. [Mental model](#1-mental-model)
2. [How results look](#2-how-results-look)
3. [Agent modes and workspace policy](#3-agent-modes-and-workspace-policy)
4. [Quick recipes](#4-quick-recipes)
5. [Check reference](#5-check-reference)
6. [Declarative UI](#6-declarative-ui)
7. [HTTP and backends](#7-http-and-backends)
8. [File and package helpers](#8-file-and-package-helpers)
9. [Authoring patterns](#9-authoring-patterns)
10. [Package layout (for contributors)](#10-package-layout-for-contributors)
11. [Adding a new check type](#11-adding-a-new-check-type)
12. [Hidden tests folder](#12-hidden-tests-folder)

---

## 1. Mental model

```text
task.yaml  checks:[]
    │
    ▼
compileChecks()     # YAML → internal { type, label?, … }
    │
    ▼
verifyCheck()        # run against workspace
    │
    ▼
report: PASS/FAIL + ✓/✗ per check
```

- **YAML keys** are author-facing (`build`, `typecheck`, `ui`, …).
- **Internal types** are what verify runs (`command`, `file_contains`, `ui`, …).
- **Labels** appear in the report (`build`, `typecheck`, `ui`, `browser`) so similar internals stay distinguishable.

Always injected:

| Check | When |
|---|---|
| `agent_exit` | Always (expects Mitii exit code `0`; dry-run forces pass) |
| `workspace_changed` | Auto for `agent.mode: agent` only — see [§3](#3-agent-modes-and-workspace-policy) |

---

## 2. How results look

```bash
pnpm case:dry-run frontend-accessible-modal-next
```

Example pass:

```text
PASS frontend-accessible-modal-next [next-js] (dry-run)
  ✓ agent_exit: dry-run
  ✓ workspace_changed: app/page.jsx
  ✓ build: npm run build -> exit 0 in 4200ms
  ✓ typecheck: npx tsc --noEmit -p tsconfig.json -> exit 0 in 900ms
  ✓ ui: npm test -- __bench__/declarative-ui.test.jsx -> exit 0 in 1100ms
```

Example fail (typecheck only):

```text
FAIL my-ts-case [ts-lib] (dry-run)
  ✓ agent_exit: dry-run
  ✓ workspace_changed: src/index.ts
  ✓ build: npm run build -> exit 0 in 800ms
  ✗ typecheck: npx tsc --noEmit … -> exit 2 in 600ms
```

- Top line `PASS` / `FAIL` = **every** check passed.
- Process exit code is `0` on PASS, `1` on FAIL.
- Use `--keep` to leave the workspace on disk and re-run commands yourself.

---

## 3. Agent modes and workspace policy

Set mode on the task:

```yaml
agent:
  mode: agent   # default — apply / edit files
  # mode: ask
  # mode: plan
```

| Mode | Auto `workspace_changed`? | Typical use |
|---|---|---|
| `agent` | **Yes** (unless you override) | Coding tasks that must edit the starter |
| `ask` | **No** | Q&A / explanation; workspace often unchanged |
| `plan` | **No** | Planning only; no apply |

### Override explicitly

```yaml
# Force require edits even in ask (rare)
agent:
  mode: ask
checks:
  - workspace_changed: true
  - build: true

# Force “must not touch files” (repair / refuse tasks)
agent:
  mode: agent
checks:
  - workspace_changed: false   # compiles to workspace_unchanged
  - build: true
```

`workspace_changed: false` and `workspace_unchanged: true` both mean: fail if the tree changed.

---

## 4. Quick recipes

### 4.1 Frontend easy case (declarative UI)

```yaml
agent:
  mode: agent
checks:
  - build: true
  - ui:
      entry: "app/page.jsx"
      steps:
        - click: { role: button, name: "/open modal/i" }
        - expect: { testId: accessible-modal }
        - press: Escape
        - expectNot: { testId: accessible-modal }
  - fileMatch:
      file: "app/page.jsx"
      patterns:
        - 'data-testid=["'']accessible-modal["'']'
```

### 4.2 TypeScript library — build + typecheck separate

```yaml
starter: ts-lib
checks:
  - build: true
  - typecheck: true
```

Report shows `✓ build` and `✓ typecheck` as distinct lines.

### 4.3 Combined compile shortcut

```yaml
checks:
  - compile: true
```

Expands to **both** labeled checks (`build` then `typecheck`).

Customize:

```yaml
checks:
  - compile:
      build: true
      typecheck: true
      buildCommand: "npm run build"
      typecheckCommand: "npx tsc --noEmit -p tsconfig.json"
      buildTimeoutMs: 180000
      typecheckTimeoutMs: 120000
```

Typecheck only:

```yaml
checks:
  - compile:
      build: false
      typecheck: true
```

### 4.4 Ask-mode case (no workspace diff)

```yaml
agent:
  mode: ask
checks:
  - build: true
  - typecheck: true
```

No auto `workspace_changed` — ask mode will not fail just because files were untouched.

### 4.5 Backend API with HTTP

```yaml
checks:
  - build: true
  - package_deps: [express, zod]
  - test:
      command: "MITII_NO_LISTEN=1 node --test tests/api.test.js"
  - http:
      start:
        command: "node src/index.js"
      timeoutMs: 15000
      requests:
        - method: GET
          path: /health
          expect:
            status: 200
            bodyContains: ok
```

### 4.6 Classic vitest file (still supported)

```yaml
checks:
  - build: true
  - test:
      command: "npm test -- tests/ui.test.jsx"
      timeoutMs: 60000
  - contains:
      file: "src/App.jsx"
      text: 'data-testid="widget"'
```

---

## 5. Check reference

### 5.1 Compile / shell family

| YAML | Report label | Default command |
|---|---|---|
| `build: true` | `build` | `npm run build` |
| `typecheck: true` | `typecheck` | `npx tsc --noEmit -p tsconfig.json` |
| `compile: true` | `build` + `typecheck` | both (see §4.3) |
| `test: { command }` | `test` | `npm test` |
| `browser: { command }` | `browser` | required |
| `command: { run }` | `command` (or `label`) | your shell |

#### `build`

```yaml
- build: true
- build:
    command: "npm run build"
    timeoutMs: 180000
```

#### `typecheck`

```yaml
- typecheck: true
- typecheck:
    command: "npx tsc --noEmit -p tsconfig.json"
    timeoutMs: 120000
```

#### `command` (escape hatch)

```yaml
- command:
    run: "npm run lint"
    exitCode: 0
    timeoutMs: 60000
    stdoutContains: "0 errors"
    label: lint          # optional — shows as ✓ lint
```

---

### 5.2 Workspace

| YAML | Meaning |
|---|---|
| `workspace_changed: true` | Tree must differ from pre-agent snapshot |
| `workspace_changed: false` | Tree must be unchanged |
| `workspace_unchanged: true` | Same as `workspace_changed: false` |

Auto-injected only for `agent.mode: agent` when you do not set either key.

---

### 5.3 Files

| YAML | Meaning |
|---|---|
| `exists: { file }` | Path exists |
| `notExists: { file }` | Path does not exist |
| `contains: { file, text }` | File includes substring |
| `notContains: { file, text }` | File does not include substring |
| `containsAny: { files, text }` | At least one file includes text |
| `fileMatch: { file, patterns }` | Regex match(es) |
| `dirHasFiles: { path, minimum? }` | Directory has ≥ N files |

#### Examples

```yaml
- exists: { file: "app/dashboard/page.jsx" }
- notExists: { file: ".env" }
- contains:
    file: "src/App.jsx"
    text: "useState"
- containsAny:
    files: ["app/page.jsx", "src/App.jsx"]
    text: 'data-testid="widget"'
- fileMatch:
    file: "src/index.ts"
    patterns:
      - "export function greet"
      - "string"
    mode: all          # default; use any for “at least one pattern”
- dirHasFiles:
    path: "app"
    minimum: 2
```

---

### 5.4 Packages, SQLite, workflows

```yaml
- package_deps: [zod, multer]
- package_deps:
    packages: [zod]
    file: package.json

- sqlite_query:
    dbPath: data/app.db
    sql: "SELECT COUNT(*) AS n FROM users"
    column: n
    equals: 3
    # or minimum: 1

- workflow:
    path: ".github/workflows/ci.yml"
    requireJobs: [test]
    requireTriggers: [push]
```

---

## 6. Declarative UI

Works with **react-js** and **next-js** starters (Vitest + Testing Library; `__bench__/` is already in Vitest `include`).

### 6.1 Full steps

```yaml
- ui:
    entry: "src/App.jsx"    # or app/page.jsx
    timeoutMs: 60000
    steps:
      - click: { role: button, name: "/submit/i" }
      - click: { testId: "open" }
      - type: { label: "Email", value: "a@b.com" }
      - press: Escape
      - press: { key: Enter }
      - tab: true
      - tab: { shift: true }
      - expect: { testId: "panel" }
      - expect: { role: dialog, focused: true }
      - expectNot: { text: "Loading" }
```

`name` / `text` / `label` values written as `/pattern/flags` become RegExps.

### 6.2 testIds shorthand

```yaml
- testid:
    entry: "src/App.jsx"
    ids: [theme-toggle, theme-label]
```

Equivalent to mounting the entry and `expect: { testId }` for each id.

### 6.3 What happens at runtime

1. Writes `__bench__/declarative-ui.test.jsx`
2. Runs `npm test -- __bench__/declarative-ui.test.jsx`
3. Deletes the generated file
4. Report label: `ui`

You can still ship a classic `tests/ui.test.jsx` and use `test:` instead — both are valid.

---

## 7. HTTP and backends

```yaml
- http:
    start:
      command: "node src/index.js"
      env:
        NODE_ENV: test
    sidecar:                    # optional second process
      command: "node mock/upstream.js"
      portEnv: UPSTREAM_PORT
    timeoutMs: 15000
    requests:
      - method: POST
        path: /items
        json: { name: "a" }
        headers:
          authorization: "Bearer t"
        expect:
          status: 201
          jsonType: object
          jsonSubset: { name: "a" }
          jsonPaths: [id]
          bodyContains: "a"
          headers:
            content-type: application/json
```

Placeholders in start command / env: `{port}`, `{sidecarPort}`.

Single-request form still works:

```yaml
- http:
    start:
      command: "node src/index.js"
    request:
      path: /health
    expect:
      status: 200
```

---

## 8. File and package helpers

Prefer **behavior** (`ui`, `http`, `test`) over long `contains` piles. Use file helpers for:

- Contract markers (`data-testid=…`)
- Config presence (`exists`)
- Forbidden secrets (`notExists: .env`)
- Required deps (`package_deps`)

---

## 9. Authoring patterns

### Agent apply case (default)

```yaml
agent:
  mode: agent
checks:
  - build: true
  - ui: { … }
```

`workspace_changed` is auto-added.

### Ask / plan case

```yaml
agent:
  mode: ask
checks:
  - build: true
  - typecheck: true
```

No workspace diff unless you add it.

### Compile-only case

```yaml
checks:
  - compile: true
```

or separate:

```yaml
checks:
  - build: true
  - typecheck: true
```

### React vs Next

Use **separate case folders** and the matching starter (`react-js` vs `next-js`). Point `ui.entry` at `src/App.jsx` or `app/page.jsx`.

---

## 10. Package layout (for contributors)

Checks are modular under `@mitii-bench/checks`:

```text
packages/checks/src/
  index.js                 # public exports
  compile/index.js         # YAML → internal checks (+ mode policy)
  verify/index.js          # dispatch + registerCheck()
  shared/
    result.js
    process.js
    snapshot.js
  builtins/                # one module per concern
    build.js
    typecheck.js
    compile-health.js      # compile: combined
    command.js
    test.js
    browser.js
    ui-check.js / ui.js / testid.js
    exists.js / not-exists.js / contains*.js / file-match*.js
    workspace-changed.js / workspace-unchanged.js
    http-check.js / http.js
    sqlite-query.js / sqlite-db.js
    package-deps.js
    workflow.js
    agent-exit.js
    …
```

Each builtin typically exports:

- `tryCompile(item)` → internal check object, array, or `null`
- `verify(check, context)` → `{ passed, details, … }`
- `type` / `yamlKey` for discovery

Root files like `compile.js`, `verify.js`, `ui.js` are thin compatibility shims.

---

## 11. Adding a new check type

1. Add Zod shape to `CheckItemSchema` in [`packages/schema/src/task.js`](../packages/schema/src/task.js).
2. Add `packages/checks/src/builtins/<name>.js` with `tryCompile` + `verify`.
3. Register the module in [`packages/checks/src/builtins/index.js`](../packages/checks/src/builtins/index.js) (`compilers` + `verifiers`).
4. Document it in this file (reference + example).
5. Add a compile/verify unit test under `packages/checks/test/`.

Old cases keep working — new types are opt-in per `task.yaml`.

---

## 12. Hidden tests folder

Case-local `tests/` is copied into the workspace **only at check time** (after the agent finishes, or after dry-run applies `solution/`).

Prefer:

| Family | Prefer |
|---|---|
| Easy frontend | `ui:` / `testid:` in YAML |
| Rich frontend | `tests/ui.test.jsx` + `test:` |
| Backend | `tests/api.test.js` + `http:` |

---

## Local verify commands

```bash
pnpm case:validate
pnpm case:dry-run <case-id>
pnpm --filter @mitii-bench/checks test
```
