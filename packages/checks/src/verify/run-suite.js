import { createSuiteState } from "../shared/suite.js";
import { verifyCheck } from "./index.js";

/**
 * Run checks with shared suite lifecycle (start/stop). Always cleans up servers.
 *
 * @param {object[]} checks
 * @param {object} baseContext - workspace, before, after, output, agentExitCode
 * @param {{ beforeCheck?: (check, context) => Promise<object|null|undefined> }} [options]
 */
export async function runCheckSuite(checks, baseContext, options = {}) {
  const suite = createSuiteState();
  const context = { ...baseContext, suite };
  const results = [];
  try {
    for (const check of checks ?? []) {
      if (options.beforeCheck) {
        const early = await options.beforeCheck(check, context);
        if (early) {
          results.push(early);
          continue;
        }
      }
      results.push(await verifyCheck(check, context));
    }
  } finally {
    await suite.cleanup();
  }
  return results;
}
