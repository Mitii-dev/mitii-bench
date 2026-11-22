import { resolveMitiiBin, runMitiiCli } from "@mitii-bench/adapter-mitii";
import { loadConfig } from "./config.js";
import { repoRoot } from "./paths.js";

/**
 * Verify Mitii is reachable and configured before spending tokens on bench runs.
 * Does not call the LLM.
 *
 * Hard requirements: resolve bin + --version + setup --show.
 * doctor is advisory unless options.strict (index may be absent on the bench repo itself).
 */
export async function runPreflight(options = {}) {
  const root = options.root ?? repoRoot();
  const config = loadConfig(root);
  const strict = Boolean(options.strict);
  const steps = [];
  let ok = true;

  const bin = resolveMitiiBin(options.mitiiBin ?? config.mitiiBin);
  steps.push({
    name: "resolve-bin",
    ok: Boolean(bin),
    details: bin ?? "not found (set MITII_BIN or runner.config.local.json mitiiBin)",
  });
  if (!bin) {
    return { ok: false, bin: null, steps };
  }

  const cliOpts = {
    mitiiBin: bin,
    cwd: root,
    env: config.env,
  };

  const version = await runMitiiCli(["--version"], { ...cliOpts, timeoutMs: 30000 });
  steps.push({
    name: "version",
    ok: version.ok,
    details: trimOut(version.stdout || version.stderr) || `exit ${version.exitCode}`,
  });
  if (!version.ok) ok = false;

  const show = await runMitiiCli(["setup", "--show"], { ...cliOpts, timeoutMs: 30000 });
  steps.push({
    name: "setup-show",
    ok: show.ok,
    details: trimOut(show.stdout || show.stderr) || `exit ${show.exitCode}`,
  });
  if (!show.ok) ok = false;

  const doctor = await runMitiiCli(["doctor"], { ...cliOpts, timeoutMs: 60000 });
  const doctorOk = doctor.ok;
  steps.push({
    name: "doctor",
    ok: doctorOk,
    soft: !strict,
    details: trimOut(doctor.stdout || doctor.stderr) || `exit ${doctor.exitCode}`,
  });
  if (strict && !doctorOk) ok = false;

  return { ok, bin, steps, strict };
}

function trimOut(text) {
  return String(text ?? "")
    .trim()
    .split(/\r?\n/)
    .slice(0, 16)
    .join("\n");
}
