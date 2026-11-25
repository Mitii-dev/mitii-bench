import { runHttpCheck } from "./http.js";

export const type = "http";
export const yamlKey = "http";

export function tryCompile(item) {
  if (!item.http) return null;
  return { type, ...item.http };
}

export async function verify(check, context) {
  return runHttpCheck(check, context.workspace, context);
}
