import { runProcess } from "../shared/process.js";
import { interpolate, interpolateEnv } from "../shared/suite.js";
import { formatCommandCheckDetails, result } from "../shared/result.js";

export const type = "posttest";
export const yamlKey = "posttest";

export function tryCompile(item) {
  if (!item.posttest) return null;
  const opts = item.posttest === true ? null : item.posttest;
  if (!opts?.command) throw new Error("posttest requires command:");
  return {
    type,
    command: opts.command,
    timeoutMs: opts.timeoutMs ?? 60000,
    env: opts.env,
    exitCode: opts.exitCode ?? 0,
    label: "posttest",
  };
}

export async function verify(check, context) {
  const command = interpolate(check.command, context.suite);
  const execution = await runProcess({
    command,
    cwd: context.workspace,
    timeoutMs: check.timeoutMs ?? 60000,
    shell: true,
    env: {
      ...context.suite?.env?.(),
      ...interpolateEnv(check.env, context.suite),
    },
  });
  const passed = execution.exitCode === (check.exitCode ?? 0);
  return result(passed, formatCommandCheckDetails(command, execution), {
    timedOut: Boolean(execution.timedOut),
    durationMs: execution.durationMs,
  });
}
