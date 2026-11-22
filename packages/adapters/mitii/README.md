# @mitii-bench/adapter-mitii

Invokes the Mitii CLI against an isolated case workspace.

## Resolve Mitii binary

Priority:

1. Explicit `mitiiBin` argument / `runner.config*.json`
2. `MITII_BIN` or `MITII_CLI`
3. `mitii` on `PATH`
4. Sibling `../Mitii/apps/cli/bin/mitii.js`

## Invocation

- Agent / bench default: `mitii agent --cwd <workspace> --prompt-file <tmp> --autonomy apply --origin automation`
- Other modes: `mitii ask|plan --cwd <workspace> --prompt-file <tmp> --origin automation`
- Diagnostics: `runMitiiCli(["doctor"])` / `["setup", "--show"]` / `["--version"]`

After a run, `readMitiiSessionMetrics(workspace)` parses `.mitii/logs/*-thread_*.jsonl` for model, duration, and tokens.

Provider/model/API keys live in Mitii (`mitii setup`, `~/.mitii/config.json`, env) — not in `task.yaml`.
