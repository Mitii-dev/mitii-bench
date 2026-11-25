import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { result } from "../shared/result.js";

/**
 * Match regex patterns against one or more workspace files.
 * mode "all" (default): every pattern must match at least one file.
 * mode "any": at least one pattern must match at least one file.
 */
export function runFileMatchCheck(check, workspace) {
  const paths = check.paths ?? (check.path ? [check.path] : []);
  if (paths.length === 0) {
    return result(false, "fileMatch requires file or files");
  }
  const patterns = check.patterns ?? [];
  if (patterns.length === 0) {
    return result(false, "fileMatch requires patterns");
  }

  const contents = [];
  for (const relative of paths) {
    const absolute = join(workspace, relative);
    if (!existsSync(absolute)) continue;
    contents.push({ relative, text: readFileSync(absolute, "utf8") });
  }
  if (contents.length === 0) {
    return result(false, `none of: ${paths.join(", ")}`);
  }

  const compiled = [];
  for (const pattern of patterns) {
    try {
      compiled.push({ source: pattern, re: new RegExp(pattern, "m") });
    } catch (error) {
      return result(false, `invalid pattern ${JSON.stringify(pattern)}: ${error.message}`);
    }
  }

  const hits = compiled.map(({ source, re }) => {
    const file = contents.find((c) => re.test(c.text));
    return { source, file: file?.relative ?? null };
  });

  const mode = check.mode ?? "all";
  const matched = hits.filter((h) => h.file);
  const passed = mode === "any" ? matched.length > 0 : matched.length === compiled.length;
  const detail =
    mode === "any"
      ? matched.length
        ? `matched ${matched.map((h) => `${h.source} @ ${h.file}`).join("; ")}`
        : `no pattern matched in ${contents.map((c) => c.relative).join(", ")}`
      : hits
          .map((h) => (h.file ? `ok ${h.source} @ ${h.file}` : `miss ${h.source}`))
          .join("; ");
  return result(passed, detail);
}
