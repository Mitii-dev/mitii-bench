import { runProcess } from "../shared/process.js";
import { formatCommandCheckDetails, result } from "../shared/result.js";

export const type = "command";
export const yamlKey = "command";

export function tryCompile(item) {
  if (!item.command) return null;
  return {
    type,
    command: item.command.run,
    exitCode: item.command.exitCode ?? 0,
    timeoutMs: item.command.timeoutMs ?? 120000,
    stdoutContains: item.command.stdoutContains,
    label: item.command.label ?? "command",
  };
}

export async function verify(check, context) {
  const execution = await runProcess({
    command: check.command,
    cwd: context.workspace,
    timeoutMs: check.timeoutMs ?? 120000,
    shell: true,
    env: { CI: "1", NEXT_TELEMETRY_DISABLED: "1" },
  });
  const passed =
    execution.exitCode === (check.exitCode ?? 0) &&
    (!check.stdoutContains || execution.stdout.includes(check.stdoutContains));
  return result(passed, formatCommandCheckDetails(check.command, execution), {
    timedOut: Boolean(execution.timedOut),
    durationMs: execution.durationMs,
  });
}

/** Shared helper for build / typecheck / test / browser wrappers. */
export function compileShellCommand({ command, timeoutMs, label, exitCode = 0, stdoutContains }) {
  return {
    type: "command",
    command,
    timeoutMs,
    exitCode,
    stdoutContains,
    label,
  };
}
