import test from "node:test";
import assert from "node:assert/strict";
import { compileChecks } from "../src/compile/index.js";
import { runCheckSuite } from "../src/verify/run-suite.js";
import { createSuiteState, interpolate } from "../src/shared/suite.js";

test("compiles start stop pretest posttest", () => {
  const checks = compileChecks(
    [
      { pretest: { command: "echo prep" } },
      {
        start: {
          command: "node server.js",
          ready: { path: "/health", status: 200 },
        },
      },
      { test: { command: "node --test tests/api.test.js" } },
      { http: { requests: [{ path: "/health", expect: { status: 200 } }] } },
      { posttest: { command: "echo cleanup" } },
      { stop: true },
    ],
    { expectWorkspaceChanged: false },
  );
  const types = checks.map((c) => c.label ?? c.type);
  assert.ok(types.includes("pretest"));
  assert.ok(types.includes("start"));
  assert.ok(types.includes("stop"));
  assert.ok(types.includes("posttest"));
  assert.ok(checks.some((c) => c.type === "http" && !c.start));
});

test("interpolate tokens", () => {
  const suite = createSuiteState();
  suite._state.port = 5555;
  suite._state.baseUrl = "http://127.0.0.1:5555";
  assert.equal(interpolate("BASE={baseUrl} P={port}", suite), "BASE=http://127.0.0.1:5555 P=5555");
});

test("start + http reuse + stop against real server", async () => {
  const { mkdtempSync, writeFileSync, rmSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(join(tmpdir(), "mitii-suite-"));
  writeFileSync(
    join(dir, "server.js"),
    `import http from "node:http";
const port = process.env.PORT;
http.createServer((req, res) => {
  if (req.url === "/health") { res.writeHead(200); res.end("ok"); return; }
  res.writeHead(404); res.end();
}).listen(Number(port), "127.0.0.1");
`,
    "utf8",
  );
  writeFileSync(
    join(dir, "hit.mjs"),
    `const r = await fetch(process.env.BASE_URL + "/health");
process.exit(r.status === 200 ? 0 : 1);
`,
    "utf8",
  );

  try {
    const checks = compileChecks(
      [
        {
          start: {
            command: "node server.js",
            ready: { path: "/health", status: 200 },
            timeoutMs: 10000,
          },
        },
        {
          http: {
            requests: [{ path: "/health", expect: { status: 200, bodyContains: "ok" } }],
            timeoutMs: 5000,
          },
        },
        {
          command: {
            run: "node hit.mjs",
            label: "curl-health",
          },
        },
        { stop: true },
      ],
      { expectWorkspaceChanged: false },
    );

    const results = await runCheckSuite(checks, {
      workspace: dir,
      output: "",
      agentExitCode: 0,
      before: {},
      after: {},
    });

    const byType = Object.fromEntries(results.map((r) => [r.type, r]));
    assert.equal(byType.start?.passed, true, byType.start?.details);
    assert.equal(byType.http?.passed, true, byType.http?.details);
    assert.equal(byType["curl-health"]?.passed, true, byType["curl-health"]?.details);
    assert.equal(byType.stop?.passed, true, byType.stop?.details);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("http without start fails if suite not started", async () => {
  const checks = compileChecks(
    [{ http: { requests: [{ path: "/health", expect: { status: 200 } }] } }],
    { expectWorkspaceChanged: false },
  );
  const results = await runCheckSuite(checks, {
    workspace: process.cwd(),
    output: "",
    agentExitCode: 0,
    before: {},
    after: {},
  });
  assert.equal(results.find((r) => r.type === "http")?.passed, false);
});
