import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { readMitiiSessionMetrics, runMitiiAgent } from "@mitii-bench/adapter-mitii";
import { runCheckSuite } from "@mitii-bench/checks";
import { loadConfig } from "./config.js";
import {
  discoverProjects,
  discoverTasks,
  loadTaskDir,
  parseTaskRef,
} from "./loader.js";
import { repoRoot, reportsDir, workspacesDir } from "./paths.js";
import { diffSnapshots, snapshotTree } from "./snapshot.js";
import {
  applyPatch,
  createWorkspace,
  ensureWorkspacePackages,
  linkFixtureNodeModules,
} from "./workspace.js";

export async function dryRunTask(taskIdOrPath, options = {}) {
  const root = repoRoot();
  const task = resolveTask(root, taskIdOrPath);
  const runId = options.runId ?? `dry-${Date.now()}`;
  const starterPath = task.starterPath ?? task.fixturePath;
  const ws = createWorkspace({
    fixturePath: starterPath,
    workspacesRoot: workspacesDir(root),
    runId,
    caseId: (task.runId ?? task.id).replaceAll("@", "__"),
    keep: options.keep ?? true,
  });

  try {
    prepareSetup(ws.path, task);
    await applySolution(ws.path, task);
    await ensureWorkspacePackages(ws.path, task, starterPath);
    const before = snapshotTree(ws.path);
    const after = snapshotTree(ws.path);
    applyTests(ws.path, task);
    const results = await runCheckSuite(
      task.checks,
      {
        output: "dry-run",
        agentExitCode: 0,
        workspace: ws.path,
        before,
        after,
      },
      {
        beforeCheck: async (check) => {
          if (check.type === "agent_exit") {
            return { type: "agent_exit", passed: true, details: "dry-run" };
          }
          if (check.type === "workspace_changed") {
            const fixtureSnap = snapshotTree(starterPath);
            const solvedSnap = snapshotTree(ws.path);
            const changed = diffSnapshots(fixtureSnap, solvedSnap).filter(
              (p) =>
                !p.startsWith("node_modules") &&
                !p.startsWith("__bench__") &&
                !p.startsWith("tests/") &&
                !p.includes("/__bench__/") &&
                !p.includes("oracle.test.js") &&
                !p.includes(".test.") &&
                !p.startsWith("package-lock.json"),
            );
            return {
              type: "workspace_changed",
              passed: changed.length > 0,
              details: changed.join(", "),
            };
          }
          return null;
        },
      },
    );
    const passed = results.every((r) => r.passed);
    const report = {
      id: task.runId ?? task.id,
      starter: task.starter,
      base: task.starter,
      mode: "dry-run",
      passed,
      workspace: ws.path,
      checks: results,
    };
    writeCaseReport(root, runId, report);
    return report;
  } finally {
    if (!options.keep) ws.cleanup();
  }
}

export async function runTask(taskIdOrPath, options = {}) {
  const root = repoRoot();
  const config = loadConfig(root);
  const task = resolveTask(root, taskIdOrPath);
  const runId = options.runId ?? `run-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const starterPath = task.starterPath ?? task.fixturePath;
  const ws = createWorkspace({
    fixturePath: starterPath,
    workspacesRoot: workspacesDir(root),
    runId,
    caseId: (task.runId ?? task.id).replaceAll("@", "__"),
    keep: options.keep ?? config.keepWorkspaces,
  });

  prepareSetup(ws.path, task);
  const before = snapshotTree(ws.path);
  let agentResult = { exitCode: 0, stdout: "", stderr: "", durationMs: 0, skipped: false };

  if (!options.skipAgent) {
    agentResult = await runMitiiAgent({
      workspace: ws.path,
      prompt: task.prompt,
      mode: task.agent?.mode ?? "agent",
      timeoutSec: task.timeoutSec ?? config.timeoutSec ?? 300,
      mitiiBin: config.mitiiBin,
      env: config.env ?? {},
    });
  }

  const after = snapshotTree(ws.path);
  await ensureWorkspacePackages(ws.path, task, starterPath);
  applyTests(ws.path, task);
  const results = await runCheckSuite(task.checks, {
    output: `${agentResult.stdout}\n${agentResult.stderr}`,
    agentExitCode: agentResult.exitCode,
    workspace: ws.path,
    before,
    after,
  });

  const session = options.skipAgent ? null : readMitiiSessionMetrics(ws.path);
  const report = {
    id: task.runId ?? task.id,
    starter: task.starter,
    base: task.starter,
    mode: options.skipAgent ? "grade-only" : "agent",
    passed: results.every((r) => r.passed),
    agent: {
      exitCode: agentResult.exitCode,
      durationMs: session?.durationMs ?? agentResult.durationMs,
      timedOut: agentResult.timedOut,
      skipped: agentResult.skipped,
      model: session?.model ?? null,
      startTime: session?.startTime ?? null,
      endTime: session?.endTime ?? null,
      inputTokens: session?.inputTokens ?? null,
      outputTokens: session?.outputTokens ?? null,
      totalTokens: session?.totalTokens ?? null,
      modelCalls: session?.modelCalls ?? null,
      toolCalls: session?.toolCalls ?? null,
    },
    workspace: ws.path,
    checks: results,
  };
  writeCaseReport(root, runId, report);
  return report;
}

export async function runProject(projectId, options = {}) {
  const root = repoRoot();
  const projects = discoverProjects(root);
  const project = projects.find((p) => p.projectId === projectId);
  if (!project) throw new Error(`Project not found: ${projectId}`);

  const runId = options.runId ?? `project-${Date.now()}`;
  const startStep = options.stepFrom ?? 1;
  const endStep = options.stepTo ?? project.steps[project.steps.length - 1].step;

  const first = project.steps[0].task;
  const fixturePath = first.starterPath ?? first.fixturePath;
  const ws = createWorkspace({
    fixturePath,
    workspacesRoot: workspacesDir(root),
    runId,
    caseId: project.projectId,
    keep: true,
  });
  prepareSetup(ws.path, first);

  const stepReports = [];
  for (const step of project.steps) {
    if (step.step < startStep || step.step > endStep) continue;
    prepareSetup(ws.path, step.task);

    if (options.dryRun) {
      await applySolution(ws.path, step.task);
    } else {
      const agentResult = await runMitiiAgent({
        workspace: ws.path,
        prompt: step.task.prompt,
        mode: step.task.agent?.mode ?? "agent",
        timeoutSec: step.task.timeoutSec ?? 300,
        mitiiBin: loadConfig(root).mitiiBin,
      });
      if (agentResult.skipped) {
        if (options.allowSolutionFallback) await applySolution(ws.path, step.task);
      }
    }

    applyTests(ws.path, step.task);
    const before = snapshotTree(ws.path);
    const after = before;
    const results = await runCheckSuite(
      step.task.checks,
      {
        output: "",
        agentExitCode: 0,
        workspace: ws.path,
        before,
        after,
      },
      {
        beforeCheck: async (check) => {
          if (check.type === "agent_exit") {
            return { type: "agent_exit", passed: true, details: "project-step" };
          }
          if (check.type === "workspace_changed") {
            return { type: "workspace_changed", passed: true, details: "cumulative" };
          }
          return null;
        },
      },
    );

    if (project.cumulative && step.regression !== false) {
      for (const prev of project.steps) {
        if (prev.step >= step.step) break;
        const regressionChecks = prev.task.checks.filter(
          (check) =>
            !["agent_exit", "workspace_changed", "workspace_unchanged", "start", "stop", "pretest", "posttest"].includes(
              check.type,
            ),
        );
        const regResults = await runCheckSuite(regressionChecks, {
          output: "",
          agentExitCode: 0,
          workspace: ws.path,
          before,
          after,
        });
        for (const r of regResults) {
          results.push({ ...r, regressionFrom: prev.task.id });
        }
      }
    }

    const report = {
      projectId: project.projectId,
      step: step.step,
      id: step.task.id,
      passed: results.every((r) => r.passed),
      checks: results,
      workspace: ws.path,
    };
    stepReports.push(report);
    writeCaseReport(root, runId, report);
    if (!report.passed && !options.continueOnFail) break;
  }

  return {
    projectId: project.projectId,
    passed: stepReports.every((r) => r.passed),
    steps: stepReports,
  };
}

export async function validateAll(root = repoRoot()) {
  const tasks = discoverTasks(root);
  const errors = [];
  const ids = new Set();
  for (const t of tasks) {
    if (t.error) {
      errors.push({ path: t.relativeDir, error: t.error });
      continue;
    }
    const key = t.runId ?? t.id;
    if (ids.has(key)) errors.push({ path: t.relativeDir, error: `Duplicate run id: ${key}` });
    ids.add(key);
  }
  try {
    discoverProjects(root);
  } catch (error) {
    errors.push({ path: "projects", error: error.message });
  }
  return { ok: errors.length === 0, count: ids.size, errors };
}

function prepareSetup(workspace, task) {
  const mock = task.setup?.mock;
  if (!mock) return;
  const candidates = [
    join(task.caseDir, mock),
    join(task.caseDir, "resources", mock),
  ];
  const from = candidates.find((p) => existsSync(p));
  if (!from) {
    throw new Error(`setup.mock not found: ${mock}`);
  }
  cpSync(from, join(workspace, mock.includes("/") ? mock.split("/").pop() : mock));
}

async function applySolution(workspace, task) {
  const solutionDir = task.solutionDir ?? join(task.caseDir, "solution");
  const legacyPerStarter = join(task.caseDir, "resources", "solution", task.starter);
  const legacyPerBase = join(task.caseDir, "resources", "solution", `base-${task.starter}`);
  const legacyFlat = join(task.caseDir, "resources", "solution");

  let copyFrom = null;
  for (const candidate of [solutionDir, legacyPerStarter, legacyPerBase, legacyFlat]) {
    if (!existsSync(candidate) || !statSync(candidate).isDirectory()) continue;
    const entries = readdirSync(candidate).filter((e) => e !== ".gitkeep" && !e.startsWith("base-"));
    if (entries.length === 0) continue;
    // Prefer flat file trees (not only nested base-* dirs)
    const hasContent = entries.some((e) => {
      const p = join(candidate, e);
      return statSync(p).isFile() || (statSync(p).isDirectory() && !e.startsWith("base-"));
    });
    if (hasContent || candidate === solutionDir) {
      copyFrom = candidate;
      break;
    }
  }

  if (copyFrom) {
    const copied = walkCopy(copyFrom, workspace);
    linkFixtureNodeModules(task.starterPath ?? task.fixturePath, workspace);
    return { method: copied ? "solution-dir" : "noop" };
  }
  if (existsSync(task.solutionPatch)) {
    return applyPatch(workspace, task.solutionPatch);
  }
  return { method: "noop" };
}

/**
 * Copy agent-hidden tests into the workspace for checking only.
 */
function applyTests(workspace, task) {
  const testsDir = task.testsDir ?? join(task.caseDir, "tests");
  const legacyPerStarter = join(task.caseDir, "resources", "oracle", task.starter);
  const legacyPerBase = join(task.caseDir, "resources", "oracle", `base-${task.starter}`);
  const legacyFlat = join(task.caseDir, "resources", "oracle");

  let copyFrom = null;
  for (const candidate of [testsDir, legacyPerStarter, legacyPerBase, legacyFlat]) {
    if (!existsSync(candidate) || !statSync(candidate).isDirectory()) continue;
    const entries = readdirSync(candidate).filter(
      (e) => e !== ".gitkeep" && !e.startsWith("base-"),
    );
    if (entries.length > 0) {
      copyFrom = candidate;
      break;
    }
  }
  if (!copyFrom) return { method: "noop" };
  // Case `tests/` holds flat files (ui.test.jsx); copy into workspace/tests/.
  // Legacy oracle trees already include __bench__/ or test/ — copy at workspace root.
  const dest =
    copyFrom === testsDir || /[/\\]tests$/.test(copyFrom)
      ? join(workspace, "tests")
      : workspace;
  mkdirSync(dest, { recursive: true });
  const copied = walkCopy(copyFrom, dest);
  return { method: copied ? "tests-dir" : "noop" };
}

function walkCopy(src, destRoot, rel = "") {
  let copied = 0;
  for (const entry of readdirSync(src)) {
    if (entry === ".gitkeep") continue;
    const from = join(src, entry);
    const relPath = rel ? `${rel}/${entry}` : entry;
    if (statSync(from).isDirectory()) {
      copied += walkCopy(from, destRoot, relPath);
    } else {
      const to = join(destRoot, relPath);
      mkdirSync(join(to, ".."), { recursive: true });
      cpSync(from, to);
      copied += 1;
    }
  }
  return copied;
}

function resolveTask(root, taskIdOrPath) {
  if (existsSync(join(taskIdOrPath, "task.yaml"))) {
    return loadTaskDir(taskIdOrPath, root);
  }
  const { id } = parseTaskRef(taskIdOrPath);
  const tasks = discoverTasks(root, { id });
  const hit =
    tasks.find((t) => !t.error && (t.runId === taskIdOrPath || t.instanceId === taskIdOrPath)) ||
    tasks.find((t) => !t.error && t.id === id);
  if (!hit) {
    throw new Error(`Task not found: ${taskIdOrPath}`);
  }
  return hit;
}

function writeCaseReport(root, runId, report) {
  const dir = join(reportsDir(root), "runs", runId, "cases");
  mkdirSync(dir, { recursive: true });
  const name = report.id ?? `step-${report.step}`;
  writeFileSync(join(dir, `${name}.json`), `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    `# ${name}`,
    "",
    `Passed: **${report.passed}**`,
    "",
    ...formatAgentMarkdown(report.agent),
    "## Checks",
    "",
    ...(report.checks ?? []).map(
      (c) => `- ${c.passed ? "PASS" : "FAIL"} \`${c.type}\`${c.details ? ` — ${c.details}` : ""}`,
    ),
    "",
  ];
  writeFileSync(join(dir, `${name}.md`), lines.join("\n"));
}

function formatAgentMarkdown(agent) {
  if (!agent || agent.skipped) {
    return ["## Agent", "", "_No agent session (dry-run / skipped)._", ""];
  }
  const totalMs = agent.durationMs;
  const totalLabel =
    totalMs == null ? "n/a" : `${(totalMs / 1000).toFixed(1)}s (${totalMs}ms)`;
  return [
    "## Agent",
    "",
    `| Field | Value |`,
    `| --- | --- |`,
    `| Model | ${agent.model ?? "n/a"} |`,
    `| Start | ${agent.startTime ?? "n/a"} |`,
    `| End | ${agent.endTime ?? "n/a"} |`,
    `| Total time | ${totalLabel} |`,
    `| Input tokens | ${agent.inputTokens ?? "n/a"} |`,
    `| Output tokens | ${agent.outputTokens ?? "n/a"} |`,
    `| Total tokens | ${agent.totalTokens ?? "n/a"} |`,
    "",
  ];
}
