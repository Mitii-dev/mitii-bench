import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { result } from "../shared/result.js";

export const type = "file_contains_any";
export const yamlKey = "containsAny";

export function tryCompile(item) {
  if (!item.containsAny) return null;
  const paths =
    item.containsAny.files ?? (item.containsAny.file ? [item.containsAny.file] : []);
  return { type, paths, value: item.containsAny.text };
}

export async function verify(check, context) {
  const paths = check.paths ?? (check.path ? [check.path] : []);
  const hit = paths.find(
    (relative) =>
      existsSync(join(context.workspace, relative)) &&
      readFileSync(join(context.workspace, relative), "utf8").includes(check.value),
  );
  return result(Boolean(hit), hit ? `matched ${hit}` : `none of: ${paths.join(", ")}`);
}
