import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import {
  _testOnly_generateUiTestSource,
  _testOnly_toRelativeImport,
  runUiCheck,
} from "../src/ui.js";
import { compileChecks } from "../src/compile.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");
const reactStarter = join(repoRoot, "starters/js/react-js");

test("toRelativeImport prefixes from __bench__", () => {
  assert.equal(_testOnly_toRelativeImport("app/page.jsx"), "../app/page.jsx");
  assert.equal(_testOnly_toRelativeImport("./src/App.jsx"), "../src/App.jsx");
});

test("generateUiTestSource embeds entry and steps", () => {
  const src = _testOnly_generateUiTestSource("src/App.jsx", [
    { click: { role: "button", name: "/open/i" } },
    { expect: { testId: "modal" } },
    { press: "Escape" },
    { expectNot: { testId: "modal" } },
  ]);
  assert.match(src, /from "\.\.\/src\/App\.jsx"/);
  assert.match(src, /"testId": "modal"/);
  assert.match(src, /user\.keyboard/);
});

test("compile ui + fileMatch shape is stable", () => {
  const [ui] = compileChecks(
    [
      {
        ui: {
          entry: "app/page.jsx",
          testIds: ["shell"],
          steps: [{ click: { testId: "open" } }],
        },
      },
    ],
    { expectWorkspaceChanged: false },
  ).filter((c) => c.type === "ui");
  assert.equal(ui.entry, "app/page.jsx");
  assert.equal(ui.steps.length, 2);
  assert.deepEqual(ui.steps[1], { expect: { testId: "shell" } });
});

test(
  "runUiCheck passes against react starter solution-like page",
  { skip: !existsSync(join(reactStarter, "node_modules", "vitest")) },
  async () => {
    const dir = mkdtempSync(join(tmpdir(), "mitii-bench-ui-"));
    try {
      for (const name of [
        "package.json",
        "package-lock.json",
        "vitest.config.js",
        "vitest.setup.js",
        "vite.config.js",
        "index.html",
      ]) {
        const from = join(reactStarter, name);
        if (existsSync(from)) cpSync(from, join(dir, name));
      }
      cpSync(join(reactStarter, "node_modules"), join(dir, "node_modules"), {
        recursive: true,
      });
      mkdirSync(join(dir, "src"), { recursive: true });
      writeFileSync(
        join(dir, "src/App.jsx"),
        `import { useState } from "react";
export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Open modal</button>
      {open ? (
        <div data-testid="accessible-modal" role="dialog">
          <button type="button" onClick={() => setOpen(false)}>Close</button>
        </div>
      ) : null}
    </div>
  );
}
`,
        "utf8",
      );

      const out = await runUiCheck(
        {
          type: "ui",
          entry: "src/App.jsx",
          timeoutMs: 90000,
          steps: [
            { click: { role: "button", name: "/open modal/i" } },
            { expect: { testId: "accessible-modal" } },
            { click: { role: "button", name: "/close/i" } },
            { expectNot: { testId: "accessible-modal" } },
          ],
        },
        dir,
      );
      assert.equal(out.passed, true, out.details);
      assert.equal(existsSync(join(dir, "__bench__", "declarative-ui.test.jsx")), false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
