import { compileShellCommand } from "./command.js";

export const yamlKey = "browser";

export function tryCompile(item) {
  if (!item.browser) return null;
  const opts = item.browser === true ? {} : item.browser;
  if (!opts.command) {
    throw new Error("browser check requires command:");
  }
  return compileShellCommand({
    command: opts.command,
    timeoutMs: opts.timeoutMs ?? 120000,
    label: "browser",
  });
}
