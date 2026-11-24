import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { openReadonlyDatabase } from "../src/sqlite.js";
import { verifyCheck } from "../src/verify.js";

const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite");

test("sqlite_query check reads row via node:sqlite", async () => {
  const dir = mkdtempSync(join(tmpdir(), "mitii-bench-sqlite-"));
  try {
    const dbPath = join(dir, "app.db");
    const write = new DatabaseSync(dbPath);
    write.exec("CREATE TABLE items (id INTEGER PRIMARY KEY, n INTEGER)");
    write.prepare("INSERT INTO items (n) VALUES (?)").run(3);
    write.close();

    const out = await verifyCheck(
      { type: "sqlite_query", dbPath: "app.db", sql: "SELECT n FROM items", column: "n", equals: 3 },
      { workspace: dir, output: "", agentExitCode: 0, before: {}, after: {} },
    );
    assert.equal(out.passed, true);
    assert.match(out.details, /n = 3/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("openReadonlyDatabase opens existing file", () => {
  const dir = mkdtempSync(join(tmpdir(), "mitii-bench-sqlite-ro-"));
  try {
    const dbPath = join(dir, "ro.db");
    const write = new DatabaseSync(dbPath);
    write.exec("CREATE TABLE t (x INTEGER)");
    write.close();
    const db = openReadonlyDatabase(dbPath);
    const rows = db.prepare("SELECT COUNT(*) AS c FROM t").all();
    assert.equal(rows[0].c, 0);
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
