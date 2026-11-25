import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { result } from "../shared/result.js";

export const type = "file_contains";
export const yamlKey = "contains";

export function tryCompile(item) {
  if (!item.contains) return null;
  return {
    type,
    path: item.contains.file,
    value: item.contains.text,
  };
}

export async function verify(check, context) {
  const path = join(context.workspace, check.path);
  const contains = existsSync(path) && readFileSync(path, "utf8").includes(check.value);
  return result(contains);
}
