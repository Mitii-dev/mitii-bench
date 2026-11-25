import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  parseVersion,
  satisfiesMax,
  satisfiesMin,
  stripRangePrefix,
  versionsEqual,
} from "../shared/semver.js";
import { result } from "../shared/result.js";

export const type = "package_deps";
export const yamlKey = "package_deps";

/**
 * Normalize YAML package specs to { name, min?, max?, equals?, installed? }.
 */
export function normalizePackageSpecs(packages, defaultInstalled = false) {
  return (packages ?? []).map((entry) => {
    if (typeof entry === "string") {
      return { name: entry, installed: defaultInstalled || undefined };
    }
    return {
      name: entry.name,
      min: entry.min,
      max: entry.max,
      equals: entry.equals,
      installed: entry.installed ?? (defaultInstalled || undefined),
    };
  });
}

export function tryCompile(item) {
  if (!item.package_deps) return null;
  const raw = item.package_deps;
  const list = Array.isArray(raw) ? raw : (raw.packages ?? []);
  const defaultInstalled = !Array.isArray(raw) && raw.installed === true;
  return {
    type,
    packages: normalizePackageSpecs(list, defaultInstalled),
    file: Array.isArray(raw) ? "package.json" : (raw.file ?? "package.json"),
    label: "package_deps",
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

  const failures = [];
  const oks = [];

  for (const spec of check.packages ?? []) {
    const outcome = checkOnePackage(spec, deps, context.workspace);
    if (outcome.ok) oks.push(outcome.detail);
    else failures.push(outcome.detail);
  }

  return result(
    failures.length === 0,
    failures.length ? failures.join("; ") : `ok: ${oks.join(", ")}`,
  );
}

function checkOnePackage(spec, deps, workspace) {
  const name = spec.name;
  if (!(name in deps)) {
    return { ok: false, detail: `missing: ${name}` };
  }
  const declaredRaw = String(deps[name]);
  const declaredParsed = parseVersion(declaredRaw);

  if (spec.min || spec.max || spec.equals) {
    if (!declaredParsed) {
      return {
        ok: false,
        detail: `${name}: cannot parse version ${JSON.stringify(declaredRaw)}`,
      };
    }
  }

  if (spec.equals !== undefined) {
    const wantRaw = String(spec.equals);
    const exactString =
      declaredRaw === wantRaw || stripRangePrefix(declaredRaw) === stripRangePrefix(wantRaw);
    const numericOk = versionsEqual(declaredParsed, wantRaw);
    if (!exactString && !numericOk) {
      return {
        ok: false,
        detail: `${name}: expected equals ${wantRaw}, got ${declaredRaw}`,
      };
    }
  }

  if (spec.min !== undefined && !satisfiesMin(declaredParsed, spec.min)) {
    return {
      ok: false,
      detail: `${name}: declared ${declaredRaw} < min ${spec.min}`,
    };
  }

  if (spec.max !== undefined && !satisfiesMax(declaredParsed, spec.max)) {
    return {
      ok: false,
      detail: `${name}: declared ${declaredRaw} > max ${spec.max}`,
    };
  }

  if (spec.installed) {
    const installedPath = join(workspace, "node_modules", ...name.split("/"), "package.json");
    if (!existsSync(installedPath)) {
      return { ok: false, detail: `${name}: not installed in node_modules` };
    }
    try {
      const installed = JSON.parse(readFileSync(installedPath, "utf8"));
      const installedVer = installed.version;
      if (spec.min && installedVer && !satisfiesMin(installedVer, spec.min)) {
        return {
          ok: false,
          detail: `${name}: installed ${installedVer} < min ${spec.min}`,
        };
      }
      if (spec.max && installedVer && !satisfiesMax(installedVer, spec.max)) {
        return {
          ok: false,
          detail: `${name}: installed ${installedVer} > max ${spec.max}`,
        };
      }
      return {
        ok: true,
        detail: `${name}@${declaredRaw} (installed ${installedVer ?? "?"})`,
      };
    } catch (error) {
      return { ok: false, detail: `${name}: invalid node_modules package.json: ${error.message}` };
    }
  }

  const constraint =
    spec.min || spec.max || spec.equals
      ? `@${declaredRaw}`
      : "";
  return { ok: true, detail: `${name}${constraint}` };
}
