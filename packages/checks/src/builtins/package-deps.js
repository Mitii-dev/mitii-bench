import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { result } from "../shared/result.js";

export const type = "package_deps";
export const yamlKey = "package_deps";

export function tryCompile(item) {
  if (!item.package_deps) return null;
  const pkgs = Array.isArray(item.package_deps)
    ? item.package_deps
    : (item.package_deps.packages ?? []);
  return {
    type,
    packages: pkgs,
    file: Array.isArray(item.package_deps)
      ? "package.json"
      : (item.package_deps.file ?? "package.json"),
  };
}

export async function verify(check, context) {
  const rel = check.file ?? "package.json";
  const path = join(context.workspace, rel);
  if (!existsSync(path)) return result(false, `${rel} not found`);
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    return result(false, `invalid package.json: ${error.message}`);
  }
  const deps = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
    ...(pkg.optionalDependencies ?? {}),
    ...(pkg.peerDependencies ?? {}),
  };
  const missing = (check.packages ?? []).filter((name) => !(name in deps));
  return result(
    missing.length === 0,
    missing.length ? `missing: ${missing.join(", ")}` : `ok: ${(check.packages ?? []).join(", ")}`,
  );
}
