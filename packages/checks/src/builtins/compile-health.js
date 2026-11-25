import { compileShellCommand } from "./command.js";
import { DEFAULT_TYPECHECK_COMMAND } from "./typecheck.js";

export const yamlKey = "compile";

/**
 * Combined build + typecheck. Expands to two labeled command checks.
 *
 * YAML:
 *   compile: true
 *   compile: { build: true, typecheck: true }
 *   compile: { build: false, typecheck: true, typecheckCommand: "…" }
 */
export function tryCompile(item) {
  if (!(item.compile === true || (item.compile && typeof item.compile === "object"))) {
    return null;
  }
  const opts = item.compile === true ? {} : item.compile;
  const wantBuild = opts.build !== false;
  const wantTypecheck = opts.typecheck !== false;
  const checks = [];

  if (wantBuild) {
    checks.push(
      compileShellCommand({
        command: opts.buildCommand ?? opts.command ?? "npm run build",
        timeoutMs: opts.buildTimeoutMs ?? opts.timeoutMs ?? 180000,
        label: "build",
      }),
    );
  }
  if (wantTypecheck) {
    checks.push(
      compileShellCommand({
        command: opts.typecheckCommand ?? DEFAULT_TYPECHECK_COMMAND,
        timeoutMs: opts.typecheckTimeoutMs ?? opts.timeoutMs ?? 120000,
        label: "typecheck",
      }),
    );
  }
  if (checks.length === 0) {
    throw new Error("compile check requires build and/or typecheck");
  }
  return checks;
}
