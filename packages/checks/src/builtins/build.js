import { compileShellCommand } from "./command.js";

export const yamlKey = "build";

export function tryCompile(item) {
  if (!(item.build === true || (item.build && typeof item.build === "object"))) return null;
  const opts = item.build === true ? {} : item.build;
  return compileShellCommand({
    command: opts.command ?? "npm run build",
    timeoutMs: opts.timeoutMs ?? 180000,
    label: "build",
  });
}
