import test from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { normalizeStarterId } from "@mitii-bench/schema";
import { parseTaskRef } from "../src/loader.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

test("normalizeStarterId strips base- prefix", () => {
  assert.equal(normalizeStarterId("base-react-js"), "react-js");
  assert.equal(normalizeStarterId("react-js"), "react-js");
  assert.equal(normalizeStarterId("base-node"), "node");
});

test("parseTaskRef returns id", () => {
  assert.deepEqual(parseTaskRef("frontend-accessible-modal-react"), {
    id: "frontend-accessible-modal-react",
    starter: null,
  });
});

test("cases root exists", () => {
  assert.ok(existsSync(join(root, "cases")), "expected cases/");
});
