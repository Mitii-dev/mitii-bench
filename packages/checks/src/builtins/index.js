/**
 * Built-in check modules. Each file owns tryCompile (YAML → internal) and/or verify.
 */
import * as agentExit from "./agent-exit.js";
import * as outputNotEmpty from "./output-not-empty.js";
import * as workspaceChanged from "./workspace-changed.js";
import * as workspaceUnchanged from "./workspace-unchanged.js";
import * as exists from "./exists.js";
import * as notExists from "./not-exists.js";
import * as contains from "./contains.js";
import * as notContains from "./not-contains.js";
import * as containsAny from "./contains-any.js";
import * as dirHasFiles from "./dir-has-files.js";
import * as fileMatch from "./file-match-check.js";
import * as command from "./command.js";
import * as build from "./build.js";
import * as typecheck from "./typecheck.js";
import * as test from "./test.js";
import * as browser from "./browser.js";
import * as compileHealth from "./compile-health.js";
import * as httpCheck from "./http-check.js";
import * as packageDeps from "./package-deps.js";
import * as sqliteQuery from "./sqlite-query.js";
import * as workflow from "./workflow.js";
import * as uiCheck from "./ui-check.js";
import * as testid from "./testid.js";
import * as start from "./start.js";
import * as stop from "./stop.js";
import * as pretest from "./pretest.js";
import * as posttest from "./posttest.js";

/** Compilers tried in order for each YAML check item. */
export const compilers = [
  contains,
  notContains,
  exists,
  notExists,
  containsAny,
  dirHasFiles,
  fileMatch,
  workflow,
  uiCheck,
  testid,
  build,
  typecheck,
  compileHealth,
  test,
  browser,
  command,
  start,
  stop,
  pretest,
  posttest,
  httpCheck,
  sqliteQuery,
  packageDeps,
  workspaceChanged,
  workspaceUnchanged,
];

/** Internal type → verify handler. */
export const verifiers = {
  [agentExit.type]: agentExit.verify,
  [outputNotEmpty.type]: outputNotEmpty.verify,
  [workspaceChanged.type]: workspaceChanged.verify,
  [workspaceUnchanged.type]: workspaceUnchanged.verify,
  [exists.type]: exists.verify,
  [notExists.type]: notExists.verify,
  [contains.type]: contains.verify,
  [notContains.type]: notContains.verify,
  [containsAny.type]: containsAny.verify,
  [dirHasFiles.type]: dirHasFiles.verify,
  [fileMatch.type]: fileMatch.verify,
  [command.type]: command.verify,
  [httpCheck.type]: httpCheck.verify,
  [packageDeps.type]: packageDeps.verify,
  [sqliteQuery.type]: sqliteQuery.verify,
  [workflow.type]: workflow.verify,
  [uiCheck.type]: uiCheck.verify,
  [start.type]: start.verify,
  [stop.type]: stop.verify,
  [pretest.type]: pretest.verify,
  [posttest.type]: posttest.verify,
};

export {
  runUiCheck,
  _testOnly_generateUiTestSource,
  _testOnly_toRelativeImport,
} from "./ui-check.js";
export { runFileMatchCheck } from "./file-match.js";
export { runHttpCheck } from "./http.js";
export { openReadonlyDatabase } from "./sqlite-db.js";
