import { diffSnapshots } from "../shared/snapshot.js";
import { result } from "../shared/result.js";

export const type = "workspace_unchanged";
export const yamlKey = "workspace_unchanged";

export function tryCompile(item) {
  if (typeof item.workspace_unchanged !== "boolean") return null;
  if (item.workspace_unchanged) {
    return { type: "workspace_unchanged", meta: { sawWorkspace: true, forceUnchanged: true } };
  }
  return { type: "workspace_changed", meta: { sawWorkspace: true } };
}

export async function verify(check, context) {
  const changed = diffSnapshots(context.before, context.after);
  return result(changed.length === 0, changed.join(", "));
}
