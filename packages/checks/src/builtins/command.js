import { runProcess } from "../shared/process.js";
import { interpolate, interpolateEnv } from "../shared/suite.js";
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
    env: item.command.env,
    label: item.command.label ?? "command",
  };
}

export async function verify(check, context) {
  const command = interpolate(check.command, context.suite);
  const execution = await runProcess({
    command,
    cwd: context.workspace,
    timeoutMs: check.timeoutMs ?? 120000,
    shell: true,
    env: {
      ...context.suite?.env?.(),
      CI: "1",
      NEXT_TELEMETRY_DISABLED: "1",
      ...interpolateEnv(check.env, context.suite),
    },
  });
  const stdoutNeedle = check.stdoutContains
    ? interpolate(check.stdoutContains, context.suite)
    : undefined;
  const passed =
    execution.exitCode === (check.exitCode ?? 0) &&
    (!stdoutNeedle || execution.stdout.includes(stdoutNeedle));
  return result(passed, formatCommandCheckDetails(command, execution), {
    timedOut: Boolean(execution.timedOut),
    durationMs: execution.durationMs,
  });
}

/** Shared helper for build / typecheck / test / browser wrappers. */
export function compileShellCommand({
  command,
  timeoutMs,
  label,
  exitCode = 0,
  stdoutContains,
  env,
}) {
  return {
    type: "command",
    command,
    timeoutMs,
    exitCode,
    stdoutContains,
    env,
    label,
  };
}
