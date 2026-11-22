import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { parse as parseYaml } from "yaml";
import { ManifestSchema, TaskSchema, normalizeStarterId } from "@mitii-bench/schema";
import { compileChecks } from "@mitii-bench/checks";
import { casesDir, startersDir } from "./paths.js";

/**
 * Layout:
 *   cases/{ecosystem}/atomic/{category}/{slug}/task.yaml
 *   cases/{ecosystem}/projects/{id}/manifest.json
 *   starters/{ecosystem}/{starter}/
 */
export function discoverTasks(root, filters = {}) {
  const suites = casesDir(root);
  const tasks = [];
  walk(suites, (dir) => {
    const taskPath = join(dir, "task.yaml");
    if (!existsSync(taskPath)) return;
    try {
      const task = loadTaskDir(dir, root);
      if (matchesFilters(task, filters)) tasks.push(task);
    } catch (error) {
      tasks.push({
        error: error.message,
        caseDir: dir,
        relativeDir: relative(root, dir),
      });
    }
  });
  return tasks.sort((a, b) => (a.runId ?? a.id ?? "").localeCompare(b.runId ?? b.id ?? ""));
}

export function loadTaskDir(caseDir, root) {
  const taskPath = join(caseDir, "task.yaml");
  if (!existsSync(taskPath)) throw new Error(`Missing task.yaml in ${caseDir}`);
  const raw = parseYaml(readFileSync(taskPath, "utf8"));
  const inferredEco = inferEcosystemFromPath(caseDir, root);
  if (!raw.ecosystem && inferredEco) raw.ecosystem = inferredEco;

  // Soft-normalize legacy keys before schema parse (migration window / hand edits)
  if (!raw.starter) {
    if (Array.isArray(raw.bases) && raw.bases[0]) raw.starter = raw.bases[0];
    else if (raw.fixture) raw.starter = raw.fixture;
  }
  if (!raw.checks && Array.isArray(raw.grade)) raw.checks = raw.grade;
  delete raw.bases;
  delete raw.fixture;
  delete raw.grade;

  const parsed = TaskSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Invalid task.yaml in ${caseDir}: ${parsed.error.issues.map((i) => i.message).join("; ")}`,
    );
  }
  const task = parsed.data;
  const starter = normalizeStarterId(task.starter) ?? task.starter;
  const readmeFile = task.readmeFile ?? "README.md";
  const promptFile = task.promptFile ?? "prompt.md";
  if (!existsSync(join(caseDir, readmeFile))) {
    throw new Error(`Missing ${readmeFile} (required case explanation)`);
  }
  let prompt = task.prompt ?? "";
  if (!prompt) {
    const promptPath = join(caseDir, promptFile);
    const legacySpec = join(caseDir, "spec.md");
    if (existsSync(promptPath)) {
      prompt = readFileSync(promptPath, "utf8");
    } else if (existsSync(legacySpec)) {
      prompt = readFileSync(legacySpec, "utf8");
    } else {
      throw new Error(`Missing ${promptFile} (agent prompt) or inline prompt:`);
    }
  }

  const starterPath = resolveStarterPath(root, task.ecosystem, starter);
  if (!starterPath) {
    throw new Error(
      `Starter not found: ${starter} (looked under starters/${task.ecosystem}/ and starters/)`,
    );
  }

  const checkItems = Array.isArray(task.checks) ? task.checks : [];
  if (checkItems.length === 0) {
    throw new Error(`No checks for ${task.id} — add checks: in task.yaml`);
  }
  const checks = compileChecks(checkItems);

  const solutionDir = resolveSolutionDir(caseDir);
  const testsDir = resolveTestsDir(caseDir);

  return {
    ...task,
    starter,
    base: starter,
    fixture: starter,
    fixturePath: starterPath,
    starterPath,
    runId: task.id,
    id: task.id,
    instanceId: task.id,
    prompt,
    readmePath: join(caseDir, readmeFile),
    caseDir,
    relativeDir: relative(root, caseDir),
    checks,
    checkItems,
    gradeItems: checkItems,
    solutionDir,
    solutionPatch: join(caseDir, "solution.patch"),
    testsDir,
  };
}

export function resolveStarterPath(root, ecosystem, starter) {
  const id = normalizeStarterId(starter) ?? starter;
  const legacy = starter.startsWith("base-") ? starter : `base-${id}`;
  const dir = startersDir(root);
  const candidates = [
    join(dir, ecosystem, id),
    join(dir, id),
    join(dir, ecosystem, legacy),
    join(dir, legacy),
    // pre-rename fixtures/
    join(root, "fixtures", ecosystem, legacy),
    join(root, "fixtures", legacy),
    join(root, "fixtures", ecosystem, id),
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }
  return null;
}

/** @deprecated use resolveStarterPath */
export function resolveFixturePath(root, ecosystem, base) {
  return resolveStarterPath(root, ecosystem, base);
}

function resolveSolutionDir(caseDir) {
  const flat = join(caseDir, "solution");
  if (existsSync(flat) && statSync(flat).isDirectory()) return flat;
  const legacy = join(caseDir, "resources", "solution");
  if (existsSync(legacy) && statSync(legacy).isDirectory()) return legacy;
  return flat;
}

function resolveTestsDir(caseDir) {
  const flat = join(caseDir, "tests");
  if (existsSync(flat) && statSync(flat).isDirectory()) return flat;
  const legacy = join(caseDir, "resources", "oracle");
  if (existsSync(legacy) && statSync(legacy).isDirectory()) return legacy;
  return flat;
}

function inferEcosystemFromPath(caseDir, root) {
  const rel = relative(casesDir(root), caseDir).replaceAll("\\", "/");
  const first = rel.split("/")[0];
  if (["js", "python", "go", "java", "rust", "other"].includes(first)) return first;
  return null;
}

export function discoverProjects(root) {
  const suites = casesDir(root);
  if (!existsSync(suites)) return [];
  const projects = [];
  for (const eco of readdirSync(suites)) {
    const projectsRoot = join(suites, eco, "projects");
    if (!existsSync(projectsRoot) || !statSync(projectsRoot).isDirectory()) continue;
    for (const entry of readdirSync(projectsRoot)) {
      const dir = join(projectsRoot, entry);
      if (!statSync(dir).isDirectory()) continue;
      if (!existsSync(join(dir, "manifest.json"))) continue;
      projects.push(loadProject(dir, root));
    }
  }
  return projects;
}

export function loadProject(projectDir, root) {
  const manifestPath = join(projectDir, "manifest.json");
  const raw = JSON.parse(readFileSync(manifestPath, "utf8"));
  const inferredEco = inferEcosystemFromPath(projectDir, root);
  if (!raw.ecosystem && inferredEco) raw.ecosystem = inferredEco;
  if (!raw.starter) {
    if (Array.isArray(raw.bases) && raw.bases[0]) raw.starter = raw.bases[0];
    else if (raw.fixture) raw.starter = raw.fixture;
  }
  delete raw.bases;
  delete raw.fixture;
  const parsed = ManifestSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Invalid manifest.json in ${projectDir}: ${parsed.error.issues.map((i) => i.message).join("; ")}`,
    );
  }
  const manifest = parsed.data;
  const projectStarter = manifest.starter ? normalizeStarterId(manifest.starter) : null;
  const steps = manifest.sequence
    .slice()
    .sort((a, b) => a.step - b.step)
    .map((step) => {
      const caseDir = join(projectDir, step.caseDir);
      const task = loadTaskDir(caseDir, root);
      if (projectStarter && task.starter !== projectStarter) {
        // Project pins a starter; case must match
      }
      return { ...step, task };
    });
  return {
    ...manifest,
    projectDir,
    relativeDir: relative(root, projectDir),
    steps,
  };
}

function matchesFilters(task, filters) {
  if (task.error) return true;
  if (filters.id) {
    const want = filters.id;
    if (task.id !== want && task.runId !== want && task.instanceId !== want) return false;
  }
  if (filters.category && task.category !== filters.category) return false;
  const starter = task.starter ?? task.base;
  if (filters.fixture && task.fixture !== filters.fixture && starter !== filters.fixture) {
    return false;
  }
  if (filters.base && starter !== filters.base && starter !== normalizeStarterId(filters.base)) {
    return false;
  }
  if (filters.starter) {
    const want = normalizeStarterId(filters.starter) ?? filters.starter;
    if (starter !== want) return false;
  }
  if (filters.family && task.family !== filters.family) return false;
  if (filters.ecosystem && task.ecosystem !== filters.ecosystem) return false;
  if (filters.package && !(task.packages ?? []).includes(filters.package)) return false;
  if (filters.difficulty && task.difficulty !== filters.difficulty) return false;
  if (filters.tag && !(task.tags ?? []).includes(filters.tag)) return false;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const hay =
      `${task.id} ${task.runId} ${task.title} ${task.prompt} ${starter} ${task.ecosystem} ${(task.tags ?? []).join(" ")}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function walk(dir, onDir) {
  if (!existsSync(dir)) return;
  onDir(dir);
  for (const entry of readdirSync(dir)) {
    if (
      entry === "node_modules" ||
      entry === "resources" ||
      entry === "grade" ||
      entry === "tests" ||
      entry === "solution"
    ) {
      continue;
    }
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, onDir);
  }
}

export function listStarters(root, ecosystem) {
  const dir = startersDir(root);
  if (!existsSync(dir)) return [];
  const out = [];
  const ecos = ecosystem
    ? [ecosystem]
    : readdirSync(dir).filter((n) => statSync(join(dir, n)).isDirectory() && !n.startsWith("."));
  for (const eco of ecos) {
    const ecoDir = join(dir, eco);
    if (eco.startsWith("base-") || !eco.includes("-") && eco.startsWith("react")) {
      // flat starter at starters root
    }
    if (eco.startsWith("base-") || ["react-js", "next-js", "node", "nest-js", "ts-lib"].includes(eco)) {
      out.push(normalizeStarterId(eco) ?? eco);
      continue;
    }
    if (!existsSync(ecoDir) || !statSync(ecoDir).isDirectory()) continue;
    for (const name of readdirSync(ecoDir)) {
      if (statSync(join(ecoDir, name)).isDirectory() && !name.startsWith(".")) {
        out.push(normalizeStarterId(name) ?? name);
      }
    }
  }
  for (const name of readdirSync(dir)) {
    if (
      (name.startsWith("base-") || ["react-js", "next-js", "node", "nest-js", "ts-lib"].includes(name)) &&
      statSync(join(dir, name)).isDirectory()
    ) {
      const id = normalizeStarterId(name) ?? name;
      if (!out.includes(id)) out.push(id);
    }
  }
  return [...new Set(out)].sort();
}

/** @deprecated use listStarters */
export function listFixtures(root, ecosystem) {
  return listStarters(root, ecosystem);
}

export function parseTaskRef(ref) {
  if (!ref) return { id: null, starter: null };
  // Legacy id@base no longer expands a matrix; treat full string as id if no match needed
  const at = ref.lastIndexOf("@");
  if (at <= 0) return { id: ref, starter: null };
  return { id: ref.slice(0, at), starter: normalizeStarterId(ref.slice(at + 1)) };
}
