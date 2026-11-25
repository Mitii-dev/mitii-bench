import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { result } from "../shared/result.js";

export const type = "file_not_contains";
export const yamlKey = "notContains";

export function tryCompile(item) {
  if (!item.notContains) return null;
  return {
    type,
    path: item.notContains.file,
    value: item.notContains.text,
  };
}

export async function verify(check, context) {
  const path = join(context.workspace, check.path);
  const contains = existsSync(path) && readFileSync(path, "utf8").includes(check.value);
  return result(!contains);
}
