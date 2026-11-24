import { createRequire } from "node:module";

/**
 * Read-only SQLite helper for checks.
 * Uses built-in `node:sqlite` (Node >=22.13) — no native npm addon.
 */
export function openReadonlyDatabase(dbPath) {
  let sqlite;
  try {
    const require = createRequire(import.meta.url);
    sqlite = require("node:sqlite");
  } catch (error) {
    throw new Error(
      `sqlite_query requires Node.js >=22.13 (built-in node:sqlite). ${error.message}`,
    );
  }
  const Database = sqlite.Database ?? sqlite.DatabaseSync;
  if (!Database) {
    throw new Error("node:sqlite is available but exports neither Database nor DatabaseSync");
  }
  return new Database(dbPath, { readOnly: true });
}
