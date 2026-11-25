# `@mitii-bench/adapter-mitii`

Thin wrapper around the Mitii CLI for isolated bench workspaces.

## Resolve bin

1. Explicit `mitiiBin` argument / `runner.config*.json`
2. `MITII_BIN` / `MITII_CLI`
3. `mitii` on `PATH`
4. Sibling `../Mitii/apps/cli/bin/mitii.js`

## Invocation

- **Agent / bench default:** `mitii run --auto --cwd <workspace> --prompt-file <tmp>`
  - Falls back to `mitii agent … --autonomy apply --origin automation` when `invocation: "agent"`
- **Ask / plan:** `mitii ask|plan --cwd <workspace> --prompt-file <tmp> --origin automation`
- Before agent runs: `mitii init --yes --no-index --no-gitignore` in the workspace (fast bootstrap)
- Stdout/stderr are **streamed** to the console by default (`stream: true`)

Diagnostics: `runMitiiCli(["doctor"])` / `["setup", "--show"]` / `["--version"]`.

After a run, `readMitiiSessionMetrics(workspace)` parses `.mitii/logs/*-thread_*.jsonl`.

Provider/model live in `~/.mitii/config.json` (use `mitii setup --provider ollama-cloud --yes --global`).  
API keys live in `~/.mitii/.env` as `MITII_API_KEY` (Ollama Cloud) — never in `task.yaml` or `runner.config*.json`.
