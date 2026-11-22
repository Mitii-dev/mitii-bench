export function result(passed, details = "", extra = {}) {
  return { passed, details, ...extra };
}

export function formatCommandCheckDetails(command, execution) {
  const status = execution.timedOut
    ? `TIMED OUT after ${execution.durationMs}ms (exit ${execution.exitCode})`
    : `exit ${execution.exitCode} in ${execution.durationMs}ms`;
  const stdout = String(execution.stdout ?? "").trim();
  const stderr = String(execution.stderr ?? "").trim();
  const body = (stderr || stdout).trim();
  return `${command} -> ${status}\n${body.slice(0, 1500)}`;
}
