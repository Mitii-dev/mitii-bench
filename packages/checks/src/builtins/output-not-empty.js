import { result } from "../shared/result.js";

export const type = "output_not_empty";

export async function verify(check, context) {
  const length = String(context.output ?? "").trim().length;
  return result(length > 0, `${length} characters`);
}
