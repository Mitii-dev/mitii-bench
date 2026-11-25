import {
  detectMitiiApiKeyEnv,
  readMitiiHostConfigSummary,
  resolveMitiiBin,
  resolveMitiiModelLabel,
  runMitiiCli,
} from "@mitii-bench/adapter-mitii";
import { loadConfig } from "./config.js";
import { repoRoot } from "./paths.js";

/**
 * Verify Mitii is reachable and configured before spending tokens on bench runs.
 * Does not call the LLM.
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

  const host = readMitiiHostConfigSummary(root);
  const model = resolveMitiiModelLabel(root);
  steps.push({
    name: "model-config",
    ok: Boolean(host?.model || model),
    soft: true,
    details: host
      ? `${host.providerPreset ?? host.provider}:${host.model} @ ${host.baseUrl ?? "(default)"} (${host.path})`
      : model ?? "no provider/model — run: mitii setup --provider ollama-cloud --yes --global",
  });

  const keys = detectMitiiApiKeyEnv(
    { ...process.env, ...(config.env ?? {}) },
    { cwd: root },
  );
  const needsKey =
    !host?.providerPreset ||
    !["ollama", "lm-studio"].includes(String(host.providerPreset));
  steps.push({
    name: "api-key",
    ok: keys.ok || !needsKey,
    soft: !strict,
    details: keys.ok
      ? `found ${keys.names.join(", ")} via ${keys.sources.join(", ")}`
      : needsKey
        ? "missing MITII_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY — for Ollama Cloud: mitii setup (pick ollama-cloud) with --global so ~/.mitii/.env is written"
        : "local provider — no API key required",
  });
  if (strict && needsKey && !keys.ok) ok = false;

  const doctor = await runMitiiCli(["doctor"], { ...cliOpts, timeoutMs: 60000 });
  steps.push({
    name: "doctor",
    ok: doctor.ok,
    soft: !strict,
    details: trimOut(doctor.stdout || doctor.stderr) || `exit ${doctor.exitCode}`,
  });
  if (strict && !doctor.ok) ok = false;

  return { ok, bin, steps, strict, model, host, apiKeys: keys };
}

function trimOut(text) {
  return String(text ?? "")
    .trim()
    .split(/\r?\n/)
    .slice(0, 20)
    .join("\n");
}
