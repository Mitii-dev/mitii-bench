/**
 * Minimal semver helpers for package_deps (no external dependency).
 * Handles common npm range prefixes: ^ ~ >= > <= < =
 */

export function stripRangePrefix(raw) {
  return String(raw ?? "")
    .trim()
    .replace(/^npm:/, "")
    .replace(/^workspace:/, "")
    .replace(/^[~^>=<\s=]+/, "")
    .replace(/\s+.*$/, "")
    .replace(/#.*/, "")
    .trim();
}

/**
 * Parse "1.2.3" / "1.2" / "1" / "1.2.3-beta.1" → [major, minor, patch]
 * Pre-release suffix is ignored for numeric compare.
 */
export function parseVersion(raw) {
  const cleaned = stripRangePrefix(raw);
  const match = cleaned.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)];
}

/** @returns {number} negative if a<b, 0 if equal, positive if a>b */
export function compareVersions(a, b) {
  const pa = Array.isArray(a) ? a : parseVersion(a);
  const pb = Array.isArray(b) ? b : parseVersion(b);
  if (!pa || !pb) return NaN;
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

export function satisfiesMin(declared, min) {
  return compareVersions(declared, min) >= 0;
}

export function satisfiesMax(declared, max) {
  return compareVersions(declared, max) <= 0;
}

export function versionsEqual(declared, expected) {
  return compareVersions(declared, expected) === 0;
}
