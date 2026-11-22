import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/** Repo root: mitii-bench/ */
export function repoRoot(cwd = process.cwd()) {
  let dir = resolve(cwd);
  for (let i = 0; i < 8; i++) {
    const hasCases = existsSync(join(dir, "cases")) || existsSync(join(dir, "suites"));
    if (existsSync(join(dir, "pnpm-workspace.yaml")) && hasCases) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return resolve(here, "../../..");
}

export function startersDir(root = repoRoot()) {
  const next = join(root, "starters");
  if (existsSync(next)) return next;
  return join(root, "fixtures");
}

/** @deprecated use startersDir */
export function fixturesDir(root = repoRoot()) {
  return startersDir(root);
}

export function casesDir(root = repoRoot()) {
  const next = join(root, "cases");
  if (existsSync(next)) return next;
  return join(root, "suites");
}

/** @deprecated use casesDir */
export function suitesDir(root = repoRoot()) {
  return casesDir(root);
}

export function catalogPath(root = repoRoot()) {
  return join(root, "catalog", "catalog.json");
}

export function workspacesDir(root = repoRoot()) {
  return join(root, ".workspaces");
}

export function reportsDir(root = repoRoot()) {
  return join(root, "reports");
}
