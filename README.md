# mitii-bench

Open-source Mitii coding-agent evaluation benchmark.

## Layout

```text
cases/                      # exam questions (task.yaml + prompt.md + tests/)
starters/                   # blank projects (pnpm starters:install)
packages/
  schema/ checks/ runner/ adapters/mitii/
```

**One case folder = one starter.** React and Next are separate cases.

## Requirements

- Node.js **>=22.13** (uses built-in `node:sqlite` for grading; no native SQLite addon in the bench packages)
- pnpm 9

Backend `node` starter / case solutions still use `better-sqlite3` **^12.10** (ships Windows/macOS/Linux prebuilds for Node 22/24). Prefer Node 22 LTS or 24 — avoid compiling from source.

## Quick start (no LLM)

```bash
pnpm install
pnpm starters:install
pnpm case:validate
pnpm --filter @mitii-bench/runner bench --dryRun --tag=smoke
pnpm cases:open
```

## Agent runs (needs Mitii)

```bash
export MITII_BIN=/path/to/Mitii/apps/cli/bin/mitii.js   # or put `mitii` on PATH
# API keys in the environment — not in runner.config.json
mitii setup --provider anthropic --yes --global

pnpm preflight          # version + setup --show + doctor
pnpm bench <case-id>    # Mitii agent --autonomy apply, then checks
```

Local path tip: copy `runner.config.example.json` → `runner.config.local.json` (gitignored) and set `mitiiBin`.

Details: [docs/RUNNING_MITII.md](./docs/RUNNING_MITII.md) · [docs/AUTHORING.md](./docs/AUTHORING.md) · [docs/CHECKS.md](./docs/CHECKS.md)

## Corpora

- Frontend: [docs/REACT_TASKS.md](./docs/REACT_TASKS.md)
- Backend: [docs/NODE_TASKS.md](./docs/NODE_TASKS.md)

## Contribute

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Apache-2.0
