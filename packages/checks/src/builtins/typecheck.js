import { compileShellCommand } from "./command.js";

export const yamlKey = "typecheck";

const DEFAULT_COMMAND = "npx tsc --noEmit -p tsconfig.json";

export function tryCompile(item) {
  if (!(item.typecheck === true || (item.typecheck && typeof item.typecheck === "object"))) {
    return null;
  }
  const opts = item.typecheck === true ? {} : item.typecheck;
  return compileShellCommand({
    command: opts.command ?? DEFAULT_COMMAND,
    timeoutMs: opts.timeoutMs ?? 120000,
    label: "typecheck",
  });
}

export { DEFAULT_COMMAND as DEFAULT_TYPECHECK_COMMAND };
