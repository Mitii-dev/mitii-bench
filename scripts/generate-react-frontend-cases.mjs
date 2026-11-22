#!/usr/bin/env node
/**
 * Materialize references/react-tasks.md into cases/js/atomic/frontend/* .
 * Vanilla: separate react + next case folders (one starter each).
 * Library: single-starter scaffolds.
 */
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { coreCases } from "./data/react-core-cases.mjs";
import { realworldCases } from "./data/react-realworld-cases.mjs";
import { libraryCases } from "./data/react-library-cases.mjs";
import { coreOracles } from "./data/react-core-oracles.mjs";
import { realworldOracles } from "./data/react-realworld-oracles.mjs";

const ORACLES = { ...coreOracles, ...realworldOracles };

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const frontendRoot = join(root, "cases", "js", "atomic", "frontend");

const FORCE = process.argv.includes("--force");
const VANILLA_ONLY = process.argv.includes("--vanilla-only");
const LIB_ONLY = process.argv.includes("--lib-only");

const STARTER_MAP = {
  "base-react-js": "react-js",
  "base-next-js": "next-js",
};

function yamlQuote(s) {
  return JSON.stringify(s);
}

function toNextPage(reactSource) {
  let src = reactSource.trim();
  if (!src.startsWith("'use client'") && !src.startsWith('"use client"')) {
    src = `'use client';\n\n${src}`;
  }
  src = src
    .replace(/export\s+function\s+App\s*\(/, "export default function Page(")
    .replace(/export\s+const\s+App\s*=/, "const Page =")
    .replace(/export\s+\{\s*App\s*\}/, "export default Page");
  if (!/export\s+default/.test(src) && /const Page\s*=/.test(src)) {
    src += "\n\nexport default Page;\n";
  }
  return src.endsWith("\n") ? src : `${src}\n`;
}

function toNextExtraPath(relPath) {
  if (relPath === "index.html") return null;
  if (relPath.startsWith("src/")) return `components/${relPath.slice(4)}`;
  return relPath;
}

function toNextTest(reactTest) {
  return reactTest
    .replaceAll('from "../src/App.jsx"', 'from "../app/page.jsx"')
    .replaceAll("from '../src/App.jsx'", "from '../app/page.jsx'")
    .replace(/import\s*\{\s*App\s*\}\s*from/g, "import Page from")
    .replace(/render\(\s*<App\s*\/>\s*\)/g, "render(<Page />)")
    .replace(/render\(\s*<App>([\s\S]*?)<\/App>\s*\)/g, "render(<Page>$1</Page>)")
    .replace(/<\s*App\s*\/>/g, "<Page />");
}

function rewriteImportsForNext(source, extraFiles = {}) {
  let out = source;
  for (const rel of Object.keys(extraFiles)) {
    if (!rel.startsWith("src/")) continue;
    const name = rel.slice(4);
    const nextFrom = `../components/${name}`;
    out = out
      .replaceAll(`from "./${name}"`, `from "${nextFrom}"`)
      .replaceAll(`from './${name}'`, `from '${nextFrom}'`)
      .replaceAll(`import("./${name}")`, `import("${nextFrom}")`)
      .replaceAll(`import('./${name}')`, `import('${nextFrom}')`);
  }
  return out;
}

function gradeTextForTestid(id) {
  if (id.endsWith("-") || id.includes("[") || id.includes("*")) {
    return id.replace(/\[.*?\]/g, "").replace(/\*/g, "");
  }
  return `data-testid="${id}"`;
}

function containsChecks(file, testids, markers) {
  const lines = [];
  const seen = new Set();
  for (const id of testids) {
    const text = gradeTextForTestid(id);
    if (seen.has(text)) continue;
    seen.add(text);
    lines.push("  - contains:");
    lines.push(`      file: ${file}`);
    lines.push(`      text: ${yamlQuote(text)}`);
  }
  for (const m of markers ?? []) {
    if (seen.has(m)) continue;
    seen.add(m);
    lines.push("  - contains:");
    lines.push(`      file: ${file}`);
    lines.push(`      text: ${yamlQuote(m)}`);
  }
  return lines.join("\n");
}

function checksFromAsserts(asserts) {
  const lines = [];
  for (const item of asserts) {
    if (item.contains) {
      lines.push("  - contains:");
      lines.push(`      file: ${item.contains.file}`);
      lines.push(`      text: ${yamlQuote(item.contains.text)}`);
    } else if (item.exists) {
      lines.push("  - exists:");
      lines.push(`      file: ${item.exists.file}`);
    }
  }
  return lines.join("\n");
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
    writeFileSync(abs, content.endsWith("\n") ? content : `${content}\n`);
  }
  return true;
}

function materializeVanillaVariant(c, { suffix, starter, entryFile, promptHint, solutionFiles, testBody }) {
  const id = `frontend-${c.slug}-${suffix}`;
  const caseDir = join(frontendRoot, `${c.slug}-${suffix}`);
  const smokeSlugs = new Set([
    "counter-state",
    "login-form",
    "todo-crud",
    "theme-context",
    "status-badge",
  ]);
  const tags = [
    ...new Set([
      ...(c.tags ?? []),
      "react-tasks",
      "vanilla",
      ...(smokeSlugs.has(c.slug) ? ["smoke"] : []),
    ]),
  ];
  const hasTest = Boolean(testBody);
  const contains = containsChecks(entryFile, c.testids, c.markers);

  const taskYaml = `id: ${id}
title: ${yamlQuote(c.title)}
ecosystem: js
starter: ${starter}
family: frontend
packages: []
difficulty: ${c.difficulty}
category: frontend
language: javascript
tags: [${tags.map((t) => yamlQuote(t)).join(", ")}]
timeoutSec: 300
promptFile: prompt.md
readmeFile: README.md
checks:
  - build: true
${
  hasTest
    ? `  - test:
      command: "npm test -- tests/ui.test.jsx"
      timeoutMs: 60000
`
    : ""
}${contains ? `${contains}\n` : ""}`;

  const readme = `# ${c.title}

## Goal

${c.prompt.split("\n")[0]}

## Starter

\`${starter}\`

\`\`\`bash
pnpm case:dry-run ${id}
\`\`\`

## How we check

- \`npm run build\`
${hasTest ? "- Hidden \`tests/ui.test.jsx\` (Vitest + Testing Library)\n" : ""}- \`contains\` markers in source
- \`solution/\` is dry-run only

Source: \`references/react-tasks.md\`.
`;

  let promptBody = c.prompt.trim();
  if (!promptBody.includes(promptHint)) {
    promptBody = `${promptBody}\n\n${promptHint}`;
  }

  const files = {
    "task.yaml": taskYaml,
    "prompt.md": `${promptBody}\n`,
    "README.md": readme,
  };
  for (const [rel, content] of Object.entries(solutionFiles)) {
    files[`solution/${rel}`] = content;
  }
  if (hasTest) {
    files["tests/ui.test.jsx"] = testBody.endsWith("\n") ? testBody : `${testBody}\n`;
  }

  const wrote = writeCaseDir(caseDir, files);
  return { id, starter, wrote, kind: "vanilla" };
}

function materializeVanilla(c) {
  const results = [];
  const reactOracle = ORACLES[c.slug]
    ? ORACLES[c.slug].endsWith("\n")
      ? ORACLES[c.slug]
      : `${ORACLES[c.slug]}\n`
    : null;

  const reactExtras = {};
  for (const [rel, content] of Object.entries(c.reactExtraFiles ?? {})) {
    reactExtras[rel] = content;
  }
  results.push(
    materializeVanillaVariant(c, {
      suffix: "react",
      starter: "react-js",
      entryFile: "src/App.jsx",
      promptHint: "For `react-js`, implement the UI in `src/App.jsx`.",
      solutionFiles: { "src/App.jsx": c.reactSolution, ...reactExtras },
      testBody: reactOracle,
    }),
  );

  const nextPage = rewriteImportsForNext(toNextPage(c.reactSolution), c.reactExtraFiles ?? {});
  const nextExtras = {};
  for (const [rel, content] of Object.entries(c.reactExtraFiles ?? {})) {
    const nextRel = toNextExtraPath(rel);
    if (!nextRel) continue;
    let nextContent = content;
    if (
      (nextRel.endsWith(".jsx") || nextRel.endsWith(".js")) &&
      !nextContent.includes("use client") &&
      /export/.test(nextContent)
    ) {
      nextContent = `'use client';\n\n${nextContent}`;
    }
    nextExtras[nextRel] = nextContent;
  }
  if (c.slug === "portal-tooltip") {
    nextExtras["app/layout.js"] = `export const metadata = {
  title: "Portal Tooltip",
  description: "mitii-bench",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Segoe UI, system-ui, sans-serif" }}>
        {children}
        <div id="modal-root" />
      </body>
    </html>
  );
}
`;
  }

  results.push(
    materializeVanillaVariant(c, {
      suffix: "next",
      starter: "next-js",
      entryFile: "app/page.jsx",
      promptHint:
        'For `next-js`, implement the UI in `app/page.jsx` as a client component (`"use client"`).',
      solutionFiles: { "app/page.jsx": nextPage, ...nextExtras },
      testBody: reactOracle ? toNextTest(reactOracle) : null,
    }),
  );

  return results;
}

function materializeLibrary(c) {
  const legacyBases = c.bases?.length ? c.bases : ["base-react-js"];
  const starter = STARTER_MAP[legacyBases[0]] ?? String(legacyBases[0]).replace(/^base-/, "");
  const suffix =
    starter === "react-js" ? null : starter === "next-js" ? null : null;
  // Keep original slug for single-starter library cases (already unique)
  const id = `frontend-${c.slug}`;
  const caseDir = join(frontendRoot, c.slug);
  const tags = [
    ...new Set([
      ...(c.tags ?? []),
      "react-tasks",
      ...(c.packages?.length ? ["ecosystem-lib"] : []),
    ]),
  ];
  const packages = c.packages ?? [];
  const entryFile = starter === "next-js" ? "app/page.js" : "src/App.jsx";
  const contains = c.gradeAsserts?.length
    ? checksFromAsserts(c.gradeAsserts)
    : containsChecks(entryFile, c.testids, c.markers);

  const taskYaml = `id: ${id}
title: ${yamlQuote(c.title)}
ecosystem: js
starter: ${starter}
family: frontend
packages: [${packages.map((p) => yamlQuote(p)).join(", ")}]
difficulty: ${c.difficulty}
category: frontend
language: javascript
tags: [${tags.map((t) => yamlQuote(t)).join(", ")}]
timeoutSec: 300
promptFile: prompt.md
readmeFile: README.md
checks:
  - build: true
${contains ? `${contains}\n` : ""}`;

  const readme = `# ${c.title}

## Goal

${c.prompt.split("\n")[0]}

## Starter

\`${starter}\`

## Packages

${packages.length ? packages.map((p) => `- \`${p}\``).join("\n") : "_None._"}

\`\`\`bash
pnpm case:validate
pnpm case:dry-run ${id}
\`\`\`

Source: \`references/react-tasks.md\`.
`;

  const files = {
    "task.yaml": taskYaml,
    "prompt.md": `${c.prompt.trim()}\n`,
    "README.md": readme,
  };
  if (c.solutionFiles && Object.keys(c.solutionFiles).length > 0) {
    for (const [rel, content] of Object.entries(c.solutionFiles)) {
      files[`solution/${rel}`] = content;
    }
  } else {
    files["solution/.gitkeep"] = "";
  }

  void suffix;
  const wrote = writeCaseDir(caseDir, files);
  return [{ id, starter, wrote, kind: "library" }];
}

function main() {
  const results = [];
  if (!LIB_ONLY) {
    for (const c of [...coreCases, ...realworldCases]) {
      results.push(...materializeVanilla(c));
    }
  }
  if (!VANILLA_ONLY) {
    for (const c of libraryCases) {
      results.push(...materializeLibrary(c));
    }
  }

  const wrote = results.filter((r) => r.wrote).length;
  const skipped = results.length - wrote;
  console.log(
    `Materialized ${wrote} cases (${skipped} skipped). Total defs: ${results.length}`,
  );
}

main();
