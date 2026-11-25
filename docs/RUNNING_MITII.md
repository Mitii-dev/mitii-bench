# Running with Mitii

Dry-run never needs Mitii. Agent runs (`pnpm bench <id>` without `--dry-run`) do.

## Ollama Cloud (recommended for your setup)

You already ran this successfully in another repo (`wedding`). **Bench uses the global Mitii host config**, not that project’s `.mitii/`.

### One-time global setup

```bash
# From any directory — write ~/.mitii/config.json + ~/.mitii/.env
mitii setup --provider ollama-cloud --model deepseek-v4.1-flash:1017 --yes --global --test
# Interactive alternative:
#   mitii setup
#   pick 2) ollama-cloud → paste key → pick model → Write → Test
#   (add --global, or run setup from ~ so keys land in ~/.mitii/)
```

What gets written:

| File | Contents |
|---|---|
| `~/.mitii/config.json` | `providerPreset: ollama-cloud`, `baseUrl: https://ollama.com/v1`, model id |
| `~/.mitii/.env` | `MITII_API_KEY=…` (never commit) |

Confirm:

```bash
mitii setup --show
# expect: preset ollama-cloud, baseUrl https://ollama.com/v1

pnpm preflight
# expect: ✓ model-config … ollama-cloud:…
#         ✓ api-key … MITII_API_KEY via …/.mitii/.env
```

> **Project vs global:** `mitii setup` inside `/wedding` only configured that workspace.  
> `pnpm bench` creates fresh workspaces under `.workspaces/` and loads **`~/.mitii`** for provider + key.

## Is Mitii configured for mitii-bench?

```bash
pnpm preflight
```

| Check | Good |
|---|---|
| `resolve-bin` | Path to Mitii CLI (`runner.config.local.json` or `MITII_BIN`) |
| `version` | e.g. `2.11.x` |
| `setup-show` | Shows provider + model |
| `model-config` | `ollama-cloud:<model>` @ `https://ollama.com/v1` |
| `api-key` | `MITII_API_KEY` from `~/.mitii/.env` (or shell) |
| `doctor` | Soft warnings OK (bench repo itself may lack an index) |

## What bench invokes (aligned with latest CLI)

```text
mitii init --yes --no-index --no-gitignore   # per workspace
mitii run --auto --cwd <workspace> --prompt-file <prompt.md>
```

Stdout/stderr stream to your terminal. Exit `124` = case `timeoutSec` hit.

Ask/plan modes: `mitii ask|plan … --origin automation`.

## Point bench at Mitii

```bash
cp runner.config.example.json runner.config.local.json
# mitiiBin → /path/to/Mitii/apps/cli/bin/mitii.js
# or:
export MITII_BIN=/path/to/Mitii/apps/cli/bin/mitii.js
```

## Secrets

**Never** put API keys in `runner.config.json` or `task.yaml`.

Mitii loads (shell wins):

1. `<cwd>/.env`
2. `<cwd>/.env.local`
3. `<cwd>/.mitii/.env`
4. `~/.mitii/.env`

Overrides: `MITII_PROVIDER`, `MITII_MODEL`, `MITII_BASE_URL`, `MITII_API_KEY`.

## Agent vs dry-run

| Command | Mitii? | Needs key? |
|---|---|---|
| `pnpm case:dry-run <id>` | No | No |
| `pnpm bench --dryRun …` | No | No |
| `pnpm bench <id>` | Yes (`run --auto`) | Yes for ollama-cloud |
| `pnpm preflight` | Diagnostics only | — |

## Interpreting FAIL

- `✗ agent_exit: exit 124` — timeout; raise `timeoutSec` or use a faster cloud model
- `✓ workspace_changed` only under `.mitii/` — agent never edited app source
- Wrong provider (old custom `openai-compatible` gateway) — re-run `mitii setup --provider ollama-cloud --yes --global`
