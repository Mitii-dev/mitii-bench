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
  assert.deepEqual(pkg.packages.map((p) => p.name), ["zod", "multer"]);

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

test("compiles notExists, containsAny, dirHasFiles, workflow", () => {
  const checks = compileChecks([
    { notExists: { file: ".env" } },
    { containsAny: { files: ["app/page.jsx", "src/App.jsx"], text: "widget" } },
    { dirHasFiles: { path: "app", minimum: 2 } },
    {
      workflow: {
        path: ".github/workflows/ci.yml",
        requireJobs: ["test"],
        requireTriggers: ["push"],
      },
    },
  ]);
  assert.ok(checks.some((c) => c.type === "file_not_exists" && c.path === ".env"));
  assert.ok(
    checks.some(
      (c) =>
        c.type === "file_contains_any" &&
        c.value === "widget" &&
        c.paths.includes("src/App.jsx"),
    ),
  );
  assert.ok(
    checks.some((c) => c.type === "dir_has_files" && c.path === "app" && c.minimum === 2),
  );
  const wf = checks.find((c) => c.type === "workflow_yaml_valid");
  assert.ok(wf);
  assert.deepEqual(wf.requireJobs, ["test"]);
  assert.deepEqual(wf.requireTriggers, ["push"]);
});

test("compiles fileMatch and ui / testid", () => {
  const checks = compileChecks([
    {
      fileMatch: {
        file: "app/page.jsx",
        patterns: ["data-testid", "Escape"],
        mode: "all",
      },
    },
    {
      ui: {
        entry: "app/page.jsx",
        steps: [
          { click: { role: "button", name: "/open/i" } },
          { expect: { testId: "modal" } },
        ],
      },
    },
    { testid: { entry: "src/App.jsx", ids: ["a", "b"] } },
  ]);
  const fm = checks.find((c) => c.type === "file_match");
  assert.ok(fm);
  assert.deepEqual(fm.paths, ["app/page.jsx"]);
  assert.deepEqual(fm.patterns, ["data-testid", "Escape"]);
  assert.equal(fm.mode, "all");

  const ui = checks.find((c) => c.type === "ui" && c.entry === "app/page.jsx");
  assert.ok(ui);
  assert.equal(ui.steps.length, 2);
  assert.equal(ui.label, "ui");

  const testid = checks.find((c) => c.type === "ui" && c.entry === "src/App.jsx");
  assert.ok(testid);
  assert.deepEqual(testid.steps, [
    { expect: { testId: "a" } },
    { expect: { testId: "b" } },
  ]);
});

test("labels build and typecheck separately", () => {
  const checks = compileChecks([
    { build: true },
    { typecheck: true },
  ]);
  const build = checks.find((c) => c.label === "build");
  const typecheck = checks.find((c) => c.label === "typecheck");
  assert.ok(build);
  assert.equal(build.command, "npm run build");
  assert.ok(typecheck);
  assert.match(typecheck.command, /tsc/);
});

test("compile: true expands to labeled build + typecheck", () => {
  const checks = compileChecks([{ compile: true }], { expectWorkspaceChanged: false });
  const labels = checks.filter((c) => c.type === "command").map((c) => c.label);
  assert.deepEqual(labels, ["build", "typecheck"]);
});

test("ask/plan modes do not auto-inject workspace_changed", () => {
  const ask = compileChecks([{ build: true }], { agentMode: "ask" });
  assert.ok(!ask.some((c) => c.type === "workspace_changed"));

  const plan = compileChecks([{ build: true }], { agentMode: "plan" });
  assert.ok(!plan.some((c) => c.type === "workspace_changed"));

  const agent = compileChecks([{ build: true }], { agentMode: "agent" });
  assert.ok(agent.some((c) => c.type === "workspace_changed"));
});

test("explicit workspace_changed still works in ask mode", () => {
  const checks = compileChecks(
    [{ workspace_changed: true }, { build: true }],
    { agentMode: "ask" },
  );
  assert.ok(checks.some((c) => c.type === "workspace_changed"));
});
