#!/usr/bin/env node
/**
 * Materialize references/node-tasks.md into cases/js/atomic/backend/* .
 */
import { mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { nodeCoreCases } from "./data/node-core-cases.mjs";
import { nodeEcosystemCases } from "./data/node-ecosystem-cases.mjs";
import { nodeRealworldCases } from "./data/node-realworld-cases.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const backendRoot = join(root, "cases", "js", "atomic", "backend");
const REF = join(root, "references", "node-tasks.md");

const FORCE = process.argv.includes("--force");
const CORE_ONLY = process.argv.includes("--core-only");
const ECO_ONLY = process.argv.includes("--eco-only");
const REAL_ONLY = process.argv.includes("--realworld-only");

const STARTER_MAP = {
  "base-node": "node",
  "base-nest-js": "nest-js",
};

function yamlQuote(s) {
  return JSON.stringify(s);
}

function parsePrompts(md) {
  const re = /^#{3,4}\s+(\d+)\.\s+(.+?)\s*$/gm;
  const matches = [...md.matchAll(re)];
  const map = new Map();
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const n = Number(m[1]);
    const start = m.index + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : md.length;
    let body = md.slice(start, end).trim();
    body = body.split(/\n---\n/)[0].trim();
    body = body.replace(/\n## .*$/s, "").trim();
    map.set(n, body);
  }
  return map;
}

function writeCaseDir(caseDir, files) {
  if (existsSync(caseDir)) {
    if (!FORCE) {
      console.log(`skip (exists): ${caseDir}`);
      return false;
    }
    rmSync(caseDir, { recursive: true, force: true });
  }
  for (const [rel, content] of Object.entries(files)) {
    const abs = join(caseDir, rel);
    mkdirSync(dirname(abs), { recursive: true });
    const text = typeof content === "string" ? content : String(content);
    writeFileSync(abs, text.endsWith("\n") ? text : `${text}\n`);
  }
  return true;
}

function materialize(c, promptFromRef) {
  const id = `backend-${c.slug}`;
  const caseDir = join(backendRoot, c.slug);
  const legacyBases = c.bases?.length ? c.bases : ["base-node"];
  const starter =
    STARTER_MAP[legacyBases[0]] ?? String(legacyBases[0]).replace(/^base-/, "");
  const packages = c.packages ?? [];
  const prompt = (promptFromRef || c.prompt || "").trim();
  const hasTest = Boolean(c.oracle);
  const hasHttp = Boolean(c.http);
  const solutionFiles = c.files ?? {};

  if (Object.keys(solutionFiles).length === 0) {
    throw new Error(`Case ${c.slug} has empty solution files`);
  }
  if (!hasTest && !hasHttp) {
    throw new Error(`Case ${c.slug} needs tests and/or http checks`);
  }

  const tags = [
    ...new Set([
      ...(c.tags ?? []),
      "node-tasks",
      ...(c.smoke ? ["smoke"] : []),
      ...(packages.length ? ["ecosystem-lib"] : ["vanilla"]),
    ]),
  ];

  const checkLines = ["  - build: true"];
  if (packages.length) {
    checkLines.push(
      `  - package_deps:\n      packages: [${packages.map((p) => yamlQuote(p)).join(", ")}]`,
    );
  }
  if (hasTest) {
    checkLines.push(`  - test:
      command: "MITII_NO_LISTEN=1 node --test tests/api.test.js"
      timeoutMs: 120000`);
  }
  const seen = new Set();
  for (const m of c.markers ?? []) {
    if (seen.has(m)) continue;
    seen.add(m);
    checkLines.push("  - contains:");
    checkLines.push(`      file: ${c.gradeFile}`);
    checkLines.push(`      text: ${yamlQuote(m)}`);
  }
  if (hasHttp) {
    checkLines.push(`  - http: ${JSON.stringify(c.http)}`);
  }

  const taskYaml = `id: ${id}
title: ${yamlQuote(c.title)}
ecosystem: js
starter: ${starter}
family: api
packages: [${packages.map((p) => yamlQuote(p)).join(", ")}]
difficulty: ${c.difficulty}
category: backend
language: javascript
tags: [${tags.map((t) => yamlQuote(t)).join(", ")}]
timeoutSec: 300
promptFile: prompt.md
readmeFile: README.md
checks:
${checkLines.join("\n")}
`;

  const implHint =
    starter === "nest-js"
      ? `Implement under the NestJS starter (\`${c.gradeFile}\` and related modules). Keep the app buildable with \`npm run build\`.`
      : `Implement primarily in \`${c.gradeFile}\` (add helper modules under \`src/\` as needed). Keep \`npm run build\` succeeding.${
          packages.length
            ? ` Install required packages: ${packages.map((p) => `\`${p}\``).join(", ")}.`
            : ""
        }`;

  const promptMd = `${prompt}

${implHint}
`;

  const kind =
    c.n <= 25 ? "Node.js core / async" : c.n <= 55 ? "frameworks & ecosystem" : "real-world backend";

  const readme = `# ${c.title}

## Goal

${prompt.split("\n")[0]}

## Starter

\`${starter}\` — ${kind} (prompt #${c.n}).

## Packages

${packages.length ? packages.map((p) => `- \`${p}\``).join("\n") : "_None beyond the starter._"}

\`\`\`bash
pnpm case:dry-run ${id}
\`\`\`

## How we check

- \`npm run build\`
${packages.length ? "- \`package_deps\`\n" : ""}${hasTest ? "- Hidden \`tests/api.test.js\`\n" : ""}${hasHttp ? "- HTTP checks\n" : ""}- Structural \`contains\` markers
- \`solution/\` is dry-run only

Source: \`references/node-tasks.md\`.
`;

  const outFiles = {
    "task.yaml": taskYaml,
    "prompt.md": promptMd,
    "README.md": readme,
  };

  for (const [rel, content] of Object.entries(solutionFiles)) {
    outFiles[`solution/${rel}`] = content;
  }
  if (hasTest) {
    const body = c.oracle.endsWith("\n") ? c.oracle : `${c.oracle}\n`;
    outFiles["tests/api.test.js"] = body;
  }

  const wrote = writeCaseDir(caseDir, outFiles);
  return {
    id,
    wrote,
    smoke: Boolean(c.smoke),
    hasHttp,
    packages: packages.length,
  };
}

function main() {
  if (!existsSync(REF)) {
    console.error(`Missing ${REF} — generators need the reference prompts file.`);
    process.exit(1);
  }
  const prompts = parsePrompts(readFileSync(REF, "utf8"));
  let cases = [...nodeCoreCases, ...nodeEcosystemCases, ...nodeRealworldCases];
  if (CORE_ONLY) cases = cases.filter((c) => c.n <= 25);
  if (ECO_ONLY) cases = cases.filter((c) => c.n >= 26 && c.n <= 55);
  if (REAL_ONLY) cases = cases.filter((c) => c.n >= 56);

  const results = [];
  for (const c of cases) {
    results.push(materialize(c, prompts.get(c.n)));
  }

  const wrote = results.filter((r) => r.wrote).length;
  console.log(
    `Materialized ${wrote}/${results.length} backend cases (http=${results.filter((r) => r.hasHttp).length}, smoke=${results.filter((r) => r.smoke).length}, withPackages=${results.filter((r) => r.packages).length})`,
  );
}

main();
