import test from "node:test";
import assert from "node:assert/strict";
import { compileChecks } from "../src/compile.js";

test("compiles contains + build and injects defaults", () => {
  const checks = compileChecks([
    { contains: { file: "src/App.jsx", text: "Docs" } },
    { build: true },
  ]);
  assert.equal(checks[0].type, "agent_exit");
  assert.ok(checks.some((c) => c.type === "workspace_changed"));
  assert.ok(checks.some((c) => c.type === "file_contains" && c.value === "Docs"));
  assert.ok(checks.some((c) => c.type === "command" && c.command === "npm run build"));
});

test("honors workspace_changed: false", () => {
  const checks = compileChecks([{ workspace_changed: false }, { build: true }]);
  assert.ok(checks.some((c) => c.type === "workspace_unchanged"));
  assert.ok(!checks.some((c) => c.type === "workspace_changed"));
});

test("compiles package_deps and test command", () => {
  const checks = compileChecks([
    { package_deps: { packages: ["zod", "multer"] } },
    { test: { command: "MITII_NO_LISTEN=1 node --test tests/api.test.js" } },
    { build: true },
  ]);
  const pkg = checks.find((c) => c.type === "package_deps");
  assert.ok(pkg);
  assert.deepEqual(pkg.packages, ["zod", "multer"]);
  assert.ok(
    checks.some(
      (c) =>
        c.type === "command" &&
        c.command === "MITII_NO_LISTEN=1 node --test tests/api.test.js",
    ),
  );
});

test("compiles browser command with label", () => {
  const checks = compileChecks([
    { browser: { command: "npx playwright test tests/browser.spec.js", timeoutMs: 90000 } },
  ]);
  const browser = checks.find((c) => c.label === "browser");
  assert.ok(browser);
  assert.equal(browser.command, "npx playwright test tests/browser.spec.js");
  assert.equal(browser.timeoutMs, 90000);
});
