import { startSuiteServer } from "../shared/suite.js";
import { result } from "../shared/result.js";

export const type = "start";
export const yamlKey = "start";

export function tryCompile(item) {
  if (!item.start) return null;
  if (item.start === true) {
    throw new Error("start check requires command:");
  }
  return {
    type,
    command: item.start.command,
    env: item.start.env,
    ready: item.start.ready,
    sidecar: item.start.sidecar,
    timeoutMs: item.start.timeoutMs ?? 15000,
    label: "start",
  };
}

export async function verify(check, context) {
  if (!context.suite) {
    return result(false, "suite context missing — runner must pass createSuiteState()");
  }
  const { port, baseUrl } = await startSuiteServer(
    context.suite,
    {
      command: check.command,
      env: check.env,
      ready: check.ready,
      sidecar: check.sidecar,
      timeoutMs: check.timeoutMs,
    },
    context.workspace,
  );
  return result(true, `ready ${baseUrl} (port ${port})`);
}
