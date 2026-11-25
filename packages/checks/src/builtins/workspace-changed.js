import { diffSnapshots } from "../shared/snapshot.js";
import { result } from "../shared/result.js";

export const type = "workspace_changed";
export const yamlKey = "workspace_changed";

export function tryCompile(item) {
  if (typeof item.workspace_changed !== "boolean") return null;
  if (item.workspace_changed) {
    return { type: "workspace_changed", meta: { sawWorkspace: true } };
  }
  return { type: "workspace_unchanged", meta: { sawWorkspace: true, forceUnchanged: true } };
}

export async function verify(check, context) {
  const changed = diffSnapshots(context.before, context.after);
  return result(changed.length > 0, changed.join(", "));
}
