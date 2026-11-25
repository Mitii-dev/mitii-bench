import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, posix } from "node:path";
import { runProcess } from "../shared/process.js";
import { formatCommandCheckDetails, result } from "../shared/result.js";

const BENCH_DIR = "__bench__";
const TEST_FILE = "declarative-ui.test.jsx";

/**
 * Declarative RTL UI check: write a generated vitest file and run it in the workspace.
 */
export async function runUiCheck(check, workspace) {
  const entry = check.entry;
  if (!entry) return result(false, "ui check requires entry");
  const steps = check.steps ?? [];
  if (steps.length === 0) return result(false, "ui check requires steps");

  const benchDir = join(workspace, BENCH_DIR);
  const testPath = join(benchDir, TEST_FILE);
  mkdirSync(benchDir, { recursive: true });
  writeFileSync(testPath, generateUiTestSource(entry, steps), "utf8");

  const command = `npm test -- ${BENCH_DIR}/${TEST_FILE}`;
  try {
    const execution = await runProcess({
      command,
      cwd: workspace,
      timeoutMs: check.timeoutMs ?? 60000,
      shell: true,
      env: { CI: "1", NEXT_TELEMETRY_DISABLED: "1" },
    });
    const passed = execution.exitCode === 0;
    return result(passed, formatCommandCheckDetails(command, execution), {
      timedOut: Boolean(execution.timedOut),
      durationMs: execution.durationMs,
    });
  } finally {
    try {
      rmSync(testPath, { force: true });
    } catch {
      // best-effort cleanup
    }
  }
}

function generateUiTestSource(entry, steps) {
  const importPath = toRelativeImport(entry);
  const stepsJson = JSON.stringify(steps, null, 2);
  return `import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Entry from ${JSON.stringify(importPath)};

const STEPS = ${stepsJson};

function resolveName(name) {
  if (typeof name !== "string") return name;
  const match = name.match(/^\\/(.+)\\/([gimsuy]*)$/);
  return match ? new RegExp(match[1], match[2]) : name;
}

function getTarget(target) {
  if (target.testId) return screen.getByTestId(target.testId);
  if (target.role) {
    return screen.getByRole(target.role, target.name ? { name: resolveName(target.name) } : undefined);
  }
  if (target.label) return screen.getByLabelText(resolveName(target.label));
  if (target.text) return screen.getByText(resolveName(target.text));
  throw new Error("ui target needs testId, role, text, or label");
}

function queryTarget(target) {
  if (target.testId) return screen.queryByTestId(target.testId);
  if (target.role) {
    return screen.queryByRole(target.role, target.name ? { name: resolveName(target.name) } : undefined);
  }
  if (target.label) return screen.queryByLabelText(resolveName(target.label));
  if (target.text) return screen.queryByText(resolveName(target.text));
  throw new Error("ui target needs testId, role, text, or label");
}

describe("declarative ui", () => {
  afterEach(() => cleanup());
  let user;
  beforeEach(() => {
    user = userEvent.setup();
  });

  it("runs yaml steps", async () => {
    render(<Entry />);
    for (const [index, step] of STEPS.entries()) {
      try {
        if (step.click) {
          await user.click(getTarget(step.click));
          continue;
        }
        if (step.type) {
          const { value, ...target } = step.type;
          const el = getTarget(target);
          await user.clear(el);
          await user.type(el, String(value));
          continue;
        }
        if (step.press !== undefined) {
          const key = typeof step.press === "string" ? step.press : step.press.key;
          await user.keyboard("{" + key + "}");
          continue;
        }
        if (step.tab) {
          const opts = step.tab === true ? undefined : { shift: Boolean(step.tab.shift) };
          await user.tab(opts);
          continue;
        }
        if (step.expect) {
          const el = getTarget(step.expect);
          expect(el).toBeTruthy();
          if (step.expect.focused) expect(document.activeElement).toBe(el);
          continue;
        }
        if (step.expectNot) {
          expect(queryTarget(step.expectNot)).toBeNull();
          continue;
        }
        throw new Error("unknown step shape: " + JSON.stringify(step));
      } catch (error) {
        error.message = "step " + (index + 1) + ": " + error.message;
        throw error;
      }
    }
  });
});
`;
}

function toRelativeImport(entry) {
  const normalized = entry.replace(/\\/g, "/").replace(/^\.\//, "");
  return posix.join("..", normalized);
}

/** @internal exported for unit tests */
export function _testOnly_generateUiTestSource(entry, steps) {
  return generateUiTestSource(entry, steps);
}

/** @internal */
export function _testOnly_toRelativeImport(entry) {
  return toRelativeImport(entry);
}
