import { existsSync } from "node:fs";
import { join } from "node:path";
import { result } from "../shared/result.js";

export const type = "file_not_exists";
export const yamlKey = "notExists";

export function tryCompile(item) {
  if (!item.notExists) return null;
  return { type, path: item.notExists.file };
}

export async function verify(check, context) {
  return result(!existsSync(join(context.workspace, check.path)));
}
