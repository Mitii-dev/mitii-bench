import { stopSuiteServer } from "../shared/suite.js";
import { result } from "../shared/result.js";

export const type = "stop";
export const yamlKey = "stop";

export function tryCompile(item) {
  if (item.stop !== true && !(item.stop && typeof item.stop === "object")) return null;
  return { type, label: "stop" };
}

export async function verify(check, context) {
  if (!context.suite) {
    return result(false, "suite context missing");
  }
  const out = await stopSuiteServer(context.suite);
  return result(true, out.details);
}
