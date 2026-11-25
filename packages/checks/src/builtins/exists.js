import { existsSync } from "node:fs";
import { join } from "node:path";
import { result } from "../shared/result.js";

export const type = "file_exists";
export const yamlKey = "exists";

export function tryCompile(item) {
  if (!item.exists) return null;
  return { type, path: item.exists.file };
}

export async function verify(check, context) {
  return result(existsSync(join(context.workspace, check.path)));
}
