import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runFileMatchCheck } from "../src/file-match.js";
import { verifyCheck } from "../src/verify.js";

function workspaceWith(files) {
  const dir = mkdtempSync(join(tmpdir(), "mitii-bench-fm-"));
  for (const [rel, body] of Object.entries(files)) {
    const absolute = join(dir, rel);
    mkdirSync(join(absolute, ".."), { recursive: true });
    writeFileSync(absolute, body, "utf8");
  }
  return dir;
}

test("file_match all patterns against one file", async () => {
  const dir = workspaceWith({
    "app/page.jsx": 'export default function Page(){ return <div data-testid="modal" /> }',
  });
  try {
    const out = await verifyCheck(
      {
        type: "file_match",
        paths: ["app/page.jsx"],
        patterns: ['data-testid=["\']modal["\']', "export default"],
        mode: "all",
      },
      { workspace: dir, output: "", agentExitCode: 0, before: {}, after: {} },
    );
    assert.equal(out.passed, true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("file_match any mode passes on one hit", () => {
  const dir = workspaceWith({ "src/App.jsx": "const x = 1;" });
  try {
    const out = runFileMatchCheck(
      {
        paths: ["src/App.jsx"],
        patterns: ["missing-token", "const x"],
        mode: "any",
      },
      dir,
    );
    assert.equal(out.passed, true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("file_match fails when file missing", () => {
  const dir = workspaceWith({});
  try {
    const out = runFileMatchCheck(
      { paths: ["nope.jsx"], patterns: ["x"], mode: "all" },
      dir,
    );
    assert.equal(out.passed, false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("file_contains_any and file_not_exists via verify", async () => {
  const dir = workspaceWith({ "src/App.jsx": "hello-widget" });
  try {
    const any = await verifyCheck(
      { type: "file_contains_any", paths: ["missing.jsx", "src/App.jsx"], value: "widget" },
      { workspace: dir, output: "", agentExitCode: 0, before: {}, after: {} },
    );
    assert.equal(any.passed, true);

    const missing = await verifyCheck(
      { type: "file_not_exists", path: ".env" },
      { workspace: dir, output: "", agentExitCode: 0, before: {}, after: {} },
    );
    assert.equal(missing.passed, true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
