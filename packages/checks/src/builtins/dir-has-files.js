import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { result } from "../shared/result.js";

export const type = "dir_has_files";
export const yamlKey = "dirHasFiles";

export function tryCompile(item) {
  if (!item.dirHasFiles) return null;
  return {
    type,
    path: item.dirHasFiles.path,
    minimum: item.dirHasFiles.minimum ?? 1,
  };
}

export async function verify(check, context) {
  const path = join(context.workspace, check.path);
  const count = existsSync(path)
    ? readdirSync(path).filter((entry) => statSync(join(path, entry)).isFile()).length
    : 0;
  return result(count >= (check.minimum ?? 1), `${count} files`);
}
