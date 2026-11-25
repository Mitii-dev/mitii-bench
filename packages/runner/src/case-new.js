import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { join } from "node:path";
import { listStarters } from "./loader.js";
import { repoRoot, casesDir } from "./paths.js";

const FAMILY_DEFAULT_STARTERS = {
  frontend: "react-js",
  api: "node",
  fullstack: "node",
  repair: "ts-lib",
  migration: "next-js",
  project: "node",
};

export async function caseNew(flags = {}) {
  const root = repoRoot();
  const ecosystem =
    flags.ecosystem ??
    (flags.lang === "python" || flags.language === "python" ? "python" : "js");
  const starters = listStarters(root, ecosystem);
  const interactive = !flags.nonInteractive && !flags.category && !flags.slug;
  const ask = interactive ? makeAsk() : null;

  const eco =
    flags.ecosystem ??
    (ask ? await ask("Ecosystem [js/python]", ecosystem) : ecosystem);
  const category =
    flags.category ??
    (ask ? await ask("Category [frontend/api/fullstack/repair/migration]", "frontend") : "frontend");
  const family =
    flags.family ??
    (["api", "fullstack", "repair", "migration", "frontend"].includes(category)
      ? category
      : "frontend");
  const slug =
    flags.slug ??
    (ask ? await ask("Slug (kebab-case)", "my-new-case") : "my-new-case");
  const suggested = FAMILY_DEFAULT_STARTERS[family] ?? starters[0] ?? "react-js";
  const starterRaw =
    flags.starter ??
    flags.base ??
    flags.fixture ??
    (ask
      ? await ask(`Starter [${starters.join(", ")}]`, suggested)
      : suggested);
  const starter = String(starterRaw).split(",")[0].trim();
  const difficulty =
    flags.difficulty ??
    (ask ? await ask("Difficulty [easy/medium/hard]", "easy") : "easy");
  const title =
    flags.title ??
    (ask ? await ask("Title", slug.replace(/-/g, " ")) : slug.replace(/-/g, " "));
  const prompt =
    flags.prompt ??
    (ask
      ? await ask("Prompt (single line)", "Describe the task for the agent.")
      : "Describe the task for the agent.");

  const id = flags.id ?? `${category}-${slug}`;
  const caseDir = join(casesDir(root), eco, "atomic", category, slug);
  if (existsSync(join(caseDir, "task.yaml"))) {
    throw new Error(`Case already exists: ${caseDir}`);
  }

  mkdirSync(join(caseDir, "solution"), { recursive: true });
  mkdirSync(join(caseDir, "tests"), { recursive: true });

  const yaml = `id: ${id}
title: ${JSON.stringify(title)}
ecosystem: ${eco}
starter: ${starter}
family: ${family}
packages: []
difficulty: ${difficulty}
category: ${category}
language: ${eco === "python" ? "python" : "javascript"}
tags: [${category}]
timeoutSec: 300
promptFile: prompt.md
readmeFile: README.md
agent:
  mode: agent
  # mode: ask | plan  → no auto workspace_changed (see docs/CHECKS.md)
checks:
  - build: true
  # - typecheck: true
  # - compile: true          # expands to labeled build + typecheck
  # Easy frontend: ui / testid / fileMatch (docs/CHECKS.md)
  # - ui:
  #     entry: "src/App.jsx"
  #     steps:
  #       - click: { role: button, name: "/open/i" }
  #       - expect: { testId: widget }
`;

  writeFileSync(join(caseDir, "task.yaml"), yaml);
  writeFileSync(join(caseDir, "prompt.md"), `${prompt}\n`);
  writeFileSync(
    join(caseDir, "README.md"),
    `# ${title}

## Goal

${prompt}

## Ecosystem

\`${eco}\`

## Starter

\`${starter}\`

## How we check

Recipes in \`task.yaml\` under \`checks:\` (see \`docs/CHECKS.md\`). Prefer declarative \`ui:\` / \`testid:\` / \`fileMatch:\` for easy frontend cases; optional hidden \`tests/\` is injected only at check time.

## Local verify

\`\`\`bash
pnpm case:validate
pnpm case:dry-run ${id}
\`\`\`
`,
  );

  ask?.close?.();

  return {
    id,
    caseDir,
    message: `Created ${caseDir}\nNext: edit prompt.md, add checks:, add tests/ and solution/, then:\n  pnpm case:validate\n  pnpm case:dry-run ${id}`,
  };
}

function makeAsk() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q, def) =>
    new Promise((resolve) => {
      rl.question(`${q}${def ? ` (${def})` : ""}: `, (answer) => {
        resolve(answer.trim() || def || "");
      });
    });
  ask.close = () => rl.close();
  return ask;
}
