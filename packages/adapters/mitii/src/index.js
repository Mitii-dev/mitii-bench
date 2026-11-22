import { spawn, spawnSync } from "node:child_process";
import {
  accessSync,
  constants,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";

/**
 * Invoke Mitii CLI against an isolated workspace.
 * Config lives here — not in individual task.yaml files.
 *
 * Current Mitii CLI (unattended agent edits):
 *   mitii agent --cwd <ws> --prompt-file <file> --autonomy apply --origin automation
 * Other modes:
 *   mitii <mode> --cwd <ws> --prompt-file <file> --origin automation
 */
export async function runMitiiAgent({
  workspace,
  prompt,
  mode = "agent",
  timeoutSec = 300,
  mitiiBin,
  env = {},
  signal,
}) {
  const bin = resolveMitiiBin(mitiiBin);
  if (!bin) {
    return {
      exitCode: 127,
      stdout: "",
      stderr:
        "Mitii CLI not found. Set MITII_BIN, put `mitii` on PATH, or set runner.config.local.json mitiiBin.",
      durationMs: 0,
      timedOut: false,
      skipped: true,
    };
  }

  const promptDir = mkdtempSync(join(tmpdir(), "mitii-bench-prompt-"));
  const promptFile = join(promptDir, "prompt.md");
  writeFileSync(promptFile, String(prompt ?? ""), "utf8");

  try {
    const args = buildMitiiArgs({ bin, workspace, promptFile, mode });
    const command = bin.endsWith(".js") ? process.execPath : bin;
    const finalArgs = bin.endsWith(".js") ? args : args.slice(1);

    return await runProcess({
      command,
      args: finalArgs,
      cwd: workspace,
      timeoutMs: timeoutSec * 1000,
      env: {
        CI: "1",
        ...env,
      },
      signal,
    });
  } finally {
    rmSync(promptDir, { recursive: true, force: true });
  }
}

export function buildMitiiArgs({ bin, workspace, promptFile, mode = "agent" }) {
  const prefix = bin.endsWith(".js") ? [bin] : [];
  const verb =
    mode === "plan" || mode === "agent" || mode === "ask" ? mode : "agent";
  const args = [
    ...prefix,
    verb,
    "--cwd",
    workspace,
    "--prompt-file",
    promptFile,
    "--origin",
    "automation",
  ];

  // Unattended edits for bench: apply autonomy (no interactive approvals).
  if (verb === "agent") {
    args.push("--autonomy", "apply");
  }

  return args;
}

/** Session JSONL: legacy `cli-*.jsonl` or current `MM-DD-YYYY-HH-MM-thread_*.jsonl`. */
export function isMitiiSessionLogFileName(name) {
  if (!name.endsWith(".jsonl") || name.endsWith("-model-io.jsonl")) return false;
  if (name.startsWith("cli-")) return true;
  // Host/CLI thread logs: 10-04-2026-17-14-thread_….jsonl
  return /^\d{2}-\d{2}-\d{4}-\d{2}-\d{2}(-[AP]M)?-thread_/i.test(name);
}

/**
 * Read the latest Mitii CLI session metrics from workspace `.mitii/logs/*.jsonl`.
 * Supports legacy `session_start`/`session_end` and current `run_start`/`run_end`.
 */
export function readMitiiSessionMetrics(workspace) {
  const logsDir = join(workspace, ".mitii", "logs");
  if (!existsSync(logsDir)) return null;

  const files = readdirSync(logsDir)
    .filter((name) => isMitiiSessionLogFileName(name))
    .map((name) => {
      const path = join(logsDir, name);
      return { name, path, mtimeMs: statSync(path).mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
  if (files.length === 0) return null;

  const latest = files[0].path;
  const rows = [];
  for (const line of readFileSync(latest, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      rows.push(JSON.parse(trimmed));
    } catch {
      // skip bad lines
    }
  }

  const start =
    rows.find((r) => r.kind === "run_start") ??
    rows.find((r) => r.type === "session_start");
  const end =
    [...rows].reverse().find((r) => r.kind === "run_end") ??
    [...rows].reverse().find((r) => r.type === "session_end");
  if (!start && !end) return null;

  const usage = end?.usage ?? {};
  const inputTokens = Number(usage.inputTokens ?? 0);
  const outputTokens = Number(usage.outputTokens ?? 0);
  const startTime = start?.at ?? start?.ts ?? null;
  const endTime = end?.at ?? end?.ts ?? null;
  let durationMs = end?.durationMs ?? usage.durationMs;
  if (durationMs == null && startTime && endTime) {
    durationMs = Date.parse(endTime) - Date.parse(startTime);
  }

  const model =
    start?.provider ??
    end?.provider ??
    resolveMitiiModelLabel(workspace);

  let exitCode = end?.exitCode;
  if (exitCode == null && typeof end?.status === "string") {
    exitCode = end.status === "completed" ? 0 : 1;
  }

  return {
    logFile: latest,
    model,
    provider: model,
    mode: start?.mode ?? end?.mode ?? null,
    startTime,
    endTime,
    durationMs: Number.isFinite(Number(durationMs)) ? Number(durationMs) : null,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    modelCalls: usage.modelCalls ?? null,
    toolCalls: usage.toolCalls ?? null,
    loopIterations: usage.loopIterations ?? null,
    exitCode: exitCode ?? null,
    status: end?.status ?? null,
  };
}

/** Best-effort model label when thread logs omit provider (common in run_start). */
export function resolveMitiiModelLabel(workspace) {
  const fromEnvProvider = process.env.MITII_PROVIDER?.trim();
  const fromEnvModel = process.env.MITII_MODEL?.trim();
  if (fromEnvProvider && fromEnvModel) return `${fromEnvProvider}:${fromEnvModel}`;
  if (fromEnvModel) return fromEnvModel;
  if (fromEnvProvider) return fromEnvProvider;

  for (const path of [
    join(workspace, ".mitii", "config.json"),
    join(homedir(), ".mitii", "config.json"),
  ]) {
    if (!existsSync(path)) continue;
    try {
      const cfg = JSON.parse(readFileSync(path, "utf8"));
      if (cfg.provider && cfg.model) return `${cfg.provider}:${cfg.model}`;
      if (cfg.model) return String(cfg.model);
      if (cfg.provider) return String(cfg.provider);
    } catch {
      // ignore
    }
  }
  return null;
}

/**
 * Resolve Mitii CLI binary.
 * Priority: explicit config → MITII_BIN / MITII_CLI → PATH (`mitii`) → sibling Mitii repo.
 */
export function resolveMitiiBin(configured) {
  const candidates = [
    configured,
    process.env.MITII_BIN,
    process.env.MITII_CLI,
  ].filter(Boolean);

  const fromPath = findOnPath("mitii");
  if (fromPath) candidates.push(fromPath);

  // Common sibling layout: ai-agents/Mitii next to ai-agents/mitii-bench
  candidates.push(resolve(process.cwd(), "../Mitii/apps/cli/bin/mitii.js"));
  candidates.push(resolve(process.cwd(), "../../Mitii/apps/cli/bin/mitii.js"));

  for (const candidate of candidates) {
    const abs = resolve(candidate);
    if (existsSync(abs)) return abs;
  }
  return null;
}

function findOnPath(name) {
  const pathEnv = process.env.PATH ?? "";
  const exts =
    process.platform === "win32"
      ? (process.env.PATHEXT ?? ".EXE;.CMD;.BAT;.JS").split(";").filter(Boolean)
      : [""];
  for (const dir of pathEnv.split(delimiter)) {
    if (!dir) continue;
    for (const ext of exts) {
      const candidate = join(dir, `${name}${ext}`);
      try {
        accessSync(candidate, constants.X_OK);
        return candidate;
      } catch {
        if (existsSync(candidate) && candidate.endsWith(".js")) return candidate;
      }
    }
  }
  // `which` / `where` fallback
  try {
    const cmd = process.platform === "win32" ? "where" : "which";
    const r = spawnSync(cmd, [name], { encoding: "utf8" });
    const line = String(r.stdout ?? "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .find(Boolean);
    if (line && existsSync(line)) return line;
  } catch {
    // ignore
  }
  return null;
}

/**
 * Run an arbitrary Mitii CLI subcommand (for preflight / diagnostics).
 * @returns {{ ok: boolean, bin: string|null, exitCode: number, stdout: string, stderr: string }}
 */
export async function runMitiiCli(args = ["--version"], options = {}) {
  const bin = resolveMitiiBin(options.mitiiBin);
  if (!bin) {
    return {
      ok: false,
      bin: null,
      exitCode: 127,
      stdout: "",
      stderr:
        "Mitii CLI not found. Set MITII_BIN, put `mitii` on PATH, or set runner.config.local.json mitiiBin.",
    };
  }
  const command = bin.endsWith(".js") ? process.execPath : bin;
  const finalArgs = bin.endsWith(".js") ? [bin, ...args] : args;
  const result = await runProcess({
    command,
    args: finalArgs,
    cwd: options.cwd ?? process.cwd(),
    timeoutMs: options.timeoutMs ?? 60000,
    env: { CI: "1", ...(options.env ?? {}) },
  });
  return {
    ok: result.exitCode === 0,
    bin,
    exitCode: result.exitCode,
    stdout: result.stdout,
    stderr: result.stderr,
    timedOut: result.timedOut,
  };
}

function runProcess({ command, args, cwd, env, timeoutMs, signal }) {
  return new Promise((resolvePromise) => {
    const startedAt = Date.now();
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 2000).unref();
    }, timeoutMs);

    const onAbort = () => {
      child.kill("SIGTERM");
    };
    if (signal) {
      if (signal.aborted) onAbort();
      else signal.addEventListener("abort", onAbort, { once: true });
    }

    child.stdout.on("data", (c) => {
      stdout += c;
    });
    child.stderr.on("data", (c) => {
      stderr += c;
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolvePromise({
        exitCode: 1,
        stdout,
        stderr: `${stderr}\n${error.message}`.trim(),
        durationMs: Date.now() - startedAt,
        timedOut,
      });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolvePromise({
        exitCode: timedOut ? 124 : code ?? 1,
        stdout,
        stderr,
        durationMs: Date.now() - startedAt,
        timedOut,
      });
    });
  });
}
