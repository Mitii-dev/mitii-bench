# Running with Mitii

Dry-run never needs Mitii. Agent runs (`pnpm bench <id>` without `--dry-run`) do.

## Where is Mitii?

Resolution order:

1. `--mitii-bin=<path>` (CLI flag, when supported by the command)
2. `MITII_BIN` or `MITII_CLI` environment variable
3. `runner.config.local.json` → `mitiiBin` (gitignored; local only)
4. `runner.config.json` → `mitiiBin` (committed; keep `null`)
5. `mitii` on `PATH`
6. Sibling `../Mitii/apps/cli/bin/mitii.js`

```bash
export MITII_BIN=/path/to/Mitii/apps/cli/bin/mitii.js
# or
export MITII_BIN=$(which mitii)
```

Copy [`runner.config.example.json`](../runner.config.example.json) to `runner.config.local.json` for a personal path.

## Secrets and model

**Never** put API keys in `runner.config.json` or `task.yaml`.

```bash
# Keys (shell / GitHub Secrets / CI env)
export ANTHROPIC_API_KEY=…
# or OPENAI_API_KEY / GEMINI_API_KEY / MITII_API_KEY

# Non-interactive provider setup (CI-safe)
mitii setup --provider anthropic --model claude-sonnet-4-5 --yes --global

# Optional overrides
export MITII_PROVIDER=anthropic
export MITII_MODEL=claude-sonnet-4-5
```

## Preflight (before spending tokens)

```bash
pnpm preflight
# or
pnpm --filter @mitii-bench/runner preflight -- --mitii-bin="$MITII_BIN"
```

Checks: resolve bin → `mitii --version` → `mitii setup --show` → `mitii doctor`.

## Agent vs dry-run

| Command | Mitii? | Needs keys? |
|---|---|---|
| `pnpm case:dry-run <id>` | No | No |
| `pnpm bench --dryRun --tag=smoke` | No | No |
| `pnpm bench <id>` | Yes (`--autonomy apply`) | Yes |
| `pnpm preflight` | Yes (diagnostics only) | Keys for `doctor` |

## Inspect Mitii (MCP / index)

```bash
mitii mcp list
mitii mcp tools <serverId>
mitii index --status
mitii status --json
mitii paths
mitii setup --show
```

## GitHub Actions sketch

```yaml
env:
  MITII_BIN: ${{ github.workspace }}/Mitii/apps/cli/bin/mitii.js
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
steps:
  - run: |
      "$MITII_BIN" setup --provider anthropic --yes --global
      pnpm preflight
      pnpm bench --tag=smoke
```

See [`.github/workflows/agent-nightly.example.yml`](../.github/workflows/agent-nightly.example.yml).
