import { compileShellCommand } from "./command.js";

export const yamlKey = "test";

export function tryCompile(item) {
  if (!(item.test === true || (item.test && typeof item.test === "object"))) return null;
  const opts = item.test === true ? {} : item.test;
  return compileShellCommand({
    command: opts.command ?? "npm test",
    timeoutMs: opts.timeoutMs ?? 120000,
    env: opts.env,
    label: "test",
  });
}
