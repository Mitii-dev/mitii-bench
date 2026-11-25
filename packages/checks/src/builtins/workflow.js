import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { result } from "../shared/result.js";

export const type = "workflow_yaml_valid";
export const yamlKey = "workflow";

export function tryCompile(item) {
  if (!item.workflow) return null;
  return {
    type,
    path: item.workflow.path,
    requireJobs: item.workflow.requireJobs ?? [],
    requireTriggers: item.workflow.requireTriggers ?? [],
  };
}

export async function verify(check, context) {
  const path = join(context.workspace, check.path);
  if (!existsSync(path)) return result(false, `workflow file not found: ${check.path}`);
  let parsed;
  try {
    parsed = parseYaml(readFileSync(path, "utf8"));
  } catch (error) {
    return result(false, `invalid YAML: ${error.message}`);
  }
  const jobs = Object.keys(parsed?.jobs ?? {});
  const triggers = normalizeWorkflowTriggers(parsed?.on);
  const missingJobs = (check.requireJobs ?? []).filter((job) => !jobs.includes(job));
  const missingTriggers = (check.requireTriggers ?? []).filter((t) => !triggers.includes(t));
  const passed = missingJobs.length === 0 && missingTriggers.length === 0;
  return result(passed, `jobs=${jobs.join(",")} triggers=${triggers.join(",")}`);
}

function normalizeWorkflowTriggers(on) {
  if (!on) return [];
  if (typeof on === "string") return [on];
  if (Array.isArray(on)) return on;
  if (typeof on === "object") return Object.keys(on);
  return [];
}
