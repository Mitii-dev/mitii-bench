import { result } from "../shared/result.js";

export const type = "agent_exit";

export async function verify(check, context) {
  return result(context.agentExitCode === check.equals, `exit ${context.agentExitCode}`);
}
