import { verifiers } from "../builtins/index.js";
import { result } from "../shared/result.js";

const registry = new Map();

export function registerCheck(type, handler) {
  registry.set(type, handler);
}

export function getRegisteredChecks() {
  return [...registry.keys()];
}

export async function verifyCheck(check, context) {
  try {
    const handler = registry.get(check.type) ?? verifiers[check.type];
    if (!handler) {
      return {
        type: check.label ?? check.type,
        ...result(false, `Unsupported check type: ${check.type}`),
      };
    }
    const out = await handler(check, context);
    return { type: check.label ?? check.type, ...out };
  } catch (error) {
    return { type: check.label ?? check.type, passed: false, details: error.message };
  }
}
