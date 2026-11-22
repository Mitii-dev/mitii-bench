import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { resolveMitiiBin } from "../src/index.js";

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
