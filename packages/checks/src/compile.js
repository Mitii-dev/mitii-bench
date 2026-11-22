/**
 * Compile human-friendly task.yaml checks into internal check objects.
 */
export function compileChecks(checkItems, { expectWorkspaceChanged = true } = {}) {
  const checks = [{ type: "agent_exit", equals: 0 }];

  let sawWorkspace = false;
  let forceUnchanged = false;

  for (const item of checkItems ?? []) {
    if (item.contains) {
      checks.push({
        type: "file_contains",
        path: item.contains.file,
        value: item.contains.text,
      });
      continue;
    }
    if (item.notContains) {
      checks.push({
        type: "file_not_contains",
        path: item.notContains.file,
        value: item.notContains.text,
      });
      continue;
    }
    if (item.exists) {
      checks.push({ type: "file_exists", path: item.exists.file });
      continue;
    }
    if (item.build === true || (item.build && typeof item.build === "object")) {
      const opts = item.build === true ? {} : item.build;
      checks.push({
        type: "command",
        command: opts.command ?? "npm run build",
        timeoutMs: opts.timeoutMs ?? 180000,
      });
      continue;
    }
    if (item.test === true || (item.test && typeof item.test === "object")) {
      const opts = item.test === true ? {} : item.test;
      checks.push({
        type: "command",
        command: opts.command ?? "npm test",
        timeoutMs: opts.timeoutMs ?? 120000,
      });
      continue;
    }
    if (item.browser) {
      const opts = item.browser === true ? {} : item.browser;
      if (!opts.command) {
        throw new Error("browser check requires command:");
      }
      checks.push({
        type: "command",
        command: opts.command,
        timeoutMs: opts.timeoutMs ?? 120000,
        label: "browser",
      });
      continue;
    }
    if (item.command) {
      checks.push({
        type: "command",
        command: item.command.run,
        exitCode: item.command.exitCode ?? 0,
        timeoutMs: item.command.timeoutMs ?? 120000,
        stdoutContains: item.command.stdoutContains,
      });
      continue;
    }
    if (item.http) {
      checks.push({ type: "http", ...item.http });
      continue;
    }
    if (item.sqlite_query) {
      checks.push({ type: "sqlite_query", ...item.sqlite_query });
      continue;
    }
    if (item.package_deps) {
      const pkgs = Array.isArray(item.package_deps)
        ? item.package_deps
        : (item.package_deps.packages ?? []);
      checks.push({
        type: "package_deps",
        packages: pkgs,
        file: item.package_deps.file ?? "package.json",
      });
      continue;
    }
    if (typeof item.workspace_changed === "boolean") {
      sawWorkspace = true;
      if (item.workspace_changed) checks.push({ type: "workspace_changed" });
      else {
        forceUnchanged = true;
        checks.push({ type: "workspace_unchanged" });
      }
      continue;
    }
    if (typeof item.workspace_unchanged === "boolean") {
      sawWorkspace = true;
      if (item.workspace_unchanged) {
        forceUnchanged = true;
        checks.push({ type: "workspace_unchanged" });
      } else checks.push({ type: "workspace_changed" });
      continue;
    }
  }

  if (!sawWorkspace && expectWorkspaceChanged && !forceUnchanged) {
    checks.splice(1, 0, { type: "workspace_changed" });
  }

  return checks;
}

/** @deprecated use compileChecks */
export const compileGrade = compileChecks;
