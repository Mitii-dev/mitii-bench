import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import {
  buildMitiiArgs,
  detectMitiiApiKeyEnv,
  resolveMitiiBin,
} from "../src/index.js";

test("resolveMitiiBin is callable without env", () => {
  const prevBin = process.env.MITII_BIN;
  const prevCli = process.env.MITII_CLI;
  delete process.env.MITII_BIN;
  delete process.env.MITII_CLI;
  try {
    const bin = resolveMitiiBin("/definitely/missing/mitii-xyz.js");
    assert.equal(typeof bin === "string" || bin === null, true);
  } finally {
    if (prevBin !== undefined) process.env.MITII_BIN = prevBin;
    else delete process.env.MITII_BIN;
    if (prevCli !== undefined) process.env.MITII_CLI = prevCli;
    else delete process.env.MITII_CLI;
  }
});

test("resolveMitiiBin prefers explicit existing configured path", () => {
  const path = fileURLToPath(new URL("../src/index.js", import.meta.url));
  const bin = resolveMitiiBin(path);
  assert.equal(bin, path);
});

test("buildMitiiArgs uses run --auto for agent by default", () => {
  const args = buildMitiiArgs({
    bin: "/tmp/mitii.js",
    workspace: "/ws",
    promptFile: "/tmp/p.md",
    mode: "agent",
  });
  assert.deepEqual(args.slice(1, 4), ["run", "--auto", "--cwd"]);
  assert.ok(args.includes("--prompt-file"));
});

test("buildMitiiArgs can fall back to agent --autonomy apply", () => {
  const args = buildMitiiArgs({
    bin: "/tmp/mitii.js",
    workspace: "/ws",
    promptFile: "/tmp/p.md",
    mode: "agent",
    invocation: "agent",
  });
  assert.equal(args[1], "agent");
  assert.ok(args.includes("--autonomy"));
  assert.ok(args.includes("apply"));
});

test("detectMitiiApiKeyEnv reports missing keys", () => {
  const out = detectMitiiApiKeyEnv(
    {},
    { cwd: "/tmp/mitii-bench-no-env-cwd", includeGlobal: false },
  );
  assert.equal(out.ok, false);
  assert.deepEqual(out.names, []);
  const found = detectMitiiApiKeyEnv(
    { OPENAI_API_KEY: "sk-test" },
    { cwd: "/tmp/mitii-bench-no-env-cwd", includeGlobal: false },
  );
  assert.equal(found.ok, true);
  assert.deepEqual(found.names, ["OPENAI_API_KEY"]);
  assert.ok(found.sources.includes("process.env"));
});
