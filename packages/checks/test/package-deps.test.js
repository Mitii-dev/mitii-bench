import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { compileChecks } from "../src/compile/index.js";
import { verifyCheck } from "../src/verify/index.js";
import { compareVersions, parseVersion, satisfiesMin } from "../src/shared/semver.js";

function workspaceWith(pkgJson, { install } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "mitii-bench-pkg-"));
  writeFileSync(join(dir, "package.json"), JSON.stringify(pkgJson, null, 2), "utf8");
  if (install) {
    for (const [name, version] of Object.entries(install)) {
      const parts = name.split("/");
      const target = join(dir, "node_modules", ...parts);
      mkdirSync(target, { recursive: true });
      writeFileSync(
        join(target, "package.json"),
        JSON.stringify({ name, version }, null, 2),
        "utf8",
      );
    }
  }
  return dir;
}

test("semver parse and compare", () => {
  assert.deepEqual(parseVersion("^3.2.1"), [3, 2, 1]);
  assert.deepEqual(parseVersion("~1.0"), [1, 0, 0]);
  assert.ok(satisfiesMin("^3.1.0", "3.0.0"));
  assert.ok(compareVersions("3.0.0", "2.9.9") > 0);
});

test("compiles object package specs with min/installed", () => {
  const checks = compileChecks(
    [
      {
        package_deps: {
          packages: [{ name: "zod", min: "3.0.0", installed: true }, "multer"],
          installed: false,
        },
      },
    ],
    { expectWorkspaceChanged: false },
  );
  const pkg = checks.find((c) => c.type === "package_deps");
  assert.equal(pkg.packages[0].name, "zod");
  assert.equal(pkg.packages[0].min, "3.0.0");
  assert.equal(pkg.packages[0].installed, true);
  assert.equal(pkg.packages[1].name, "multer");
});

test("package_deps passes min version", async () => {
  const dir = workspaceWith({
    dependencies: { zod: "^3.22.4", multer: "^1.4.5" },
  });
  try {
    const out = await verifyCheck(
      {
        type: "package_deps",
        packages: [
          { name: "zod", min: "3.0.0" },
          { name: "multer" },
        ],
      },
      { workspace: dir, output: "", agentExitCode: 0, before: {}, after: {} },
    );
    assert.equal(out.passed, true, out.details);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("package_deps fails when below min", async () => {
  const dir = workspaceWith({ dependencies: { zod: "^2.0.0" } });
  try {
    const out = await verifyCheck(
      { type: "package_deps", packages: [{ name: "zod", min: "3.0.0" }] },
      { workspace: dir, output: "", agentExitCode: 0, before: {}, after: {} },
    );
    assert.equal(out.passed, false);
    assert.match(out.details, /min 3\.0\.0/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("package_deps installed checks node_modules", async () => {
  const dir = workspaceWith(
    { dependencies: { zod: "^3.22.4" } },
    { install: { zod: "3.22.4" } },
  );
  const bare = workspaceWith({ dependencies: { zod: "^3.22.4" } });
  try {
    const ok = await verifyCheck(
      { type: "package_deps", packages: [{ name: "zod", min: "3.0.0", installed: true }] },
      { workspace: dir, output: "", agentExitCode: 0, before: {}, after: {} },
    );
    assert.equal(ok.passed, true, ok.details);

    const missing = await verifyCheck(
      { type: "package_deps", packages: [{ name: "zod", installed: true }] },
      { workspace: bare, output: "", agentExitCode: 0, before: {}, after: {} },
    );
    assert.equal(missing.passed, false);
    assert.match(missing.details, /not installed/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
    rmSync(bare, { recursive: true, force: true });
  }
});

test("package_deps equals and max", async () => {
  const dir = workspaceWith({ dependencies: { antd: "5.12.0" } });
  try {
    const pass = await verifyCheck(
      {
        type: "package_deps",
        packages: [{ name: "antd", equals: "5.12.0", max: "5.99.0" }],
      },
      { workspace: dir, output: "", agentExitCode: 0, before: {}, after: {} },
    );
    assert.equal(pass.passed, true, pass.details);

    const failMax = await verifyCheck(
      { type: "package_deps", packages: [{ name: "antd", max: "5.0.0" }] },
      { workspace: dir, output: "", agentExitCode: 0, before: {}, after: {} },
    );
    assert.equal(failMax.passed, false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
