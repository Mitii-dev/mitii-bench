import { runUiCheck, _testOnly_generateUiTestSource, _testOnly_toRelativeImport } from "./ui.js";

export const type = "ui";
export const yamlKey = "ui";

export function compileUiSteps(ui) {
  const steps = [...(ui.steps ?? [])];
  for (const id of ui.testIds ?? []) {
    steps.push({ expect: { testId: id } });
  }
  if (steps.length === 0) {
    throw new Error("ui check requires steps or testIds");
  }
  return {
    type: "ui",
    entry: ui.entry,
    steps,
    timeoutMs: ui.timeoutMs ?? 60000,
    label: "ui",
  };
}

export function tryCompile(item) {
  if (!item.ui) return null;
  return compileUiSteps(item.ui);
}

export async function verify(check, context) {
  return runUiCheck(check, context.workspace);
}

export { _testOnly_generateUiTestSource, _testOnly_toRelativeImport, runUiCheck };
