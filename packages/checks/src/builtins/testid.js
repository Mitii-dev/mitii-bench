import { compileUiSteps } from "./ui-check.js";

export const yamlKey = "testid";

export function tryCompile(item) {
  if (!item.testid) return null;
  return compileUiSteps({
    entry: item.testid.entry,
    testIds: item.testid.ids,
    timeoutMs: item.testid.timeoutMs,
  });
}
