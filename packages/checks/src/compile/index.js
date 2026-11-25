import { compilers } from "../builtins/index.js";

/** Modes that apply file edits; ask/plan typically do not. */
export const APPLY_AGENT_MODES = new Set(["agent"]);

/**
 * Compile human-friendly task.yaml checks into internal check objects.
 *
 * @param {unknown[]} checkItems
 * @param {{
 *   expectWorkspaceChanged?: boolean,
 *   agentMode?: string,
 * }} [options]
 */
export function compileChecks(checkItems, options = {}) {
  const agentMode = options.agentMode ?? "agent";
  const expectWorkspaceChanged =
    options.expectWorkspaceChanged ?? APPLY_AGENT_MODES.has(agentMode);

  const checks = [{ type: "agent_exit", equals: 0 }];

  let sawWorkspace = false;
  let forceUnchanged = false;

  for (const item of checkItems ?? []) {
    const compiled = compileOne(item);
    if (!compiled) {
      throw new Error(`Unrecognized check item: ${JSON.stringify(item)}`);
    }
    const list = Array.isArray(compiled) ? compiled : [compiled];
    for (const check of list) {
      if (check.meta?.sawWorkspace) sawWorkspace = true;
      if (check.meta?.forceUnchanged) forceUnchanged = true;
      const { meta: _meta, ...rest } = check;
      checks.push(rest);
    }
  }

  if (!sawWorkspace && expectWorkspaceChanged && !forceUnchanged) {
    checks.splice(1, 0, { type: "workspace_changed" });
  }

  return checks;
}

function compileOne(item) {
  for (const mod of compilers) {
    if (typeof mod.tryCompile !== "function") continue;
    const out = mod.tryCompile(item);
    if (out != null) return out;
  }
  return null;
}

/** @deprecated use compileChecks */
export const compileGrade = compileChecks;
