import { existsSync } from "node:fs";
import { join } from "node:path";
import { openReadonlyDatabase } from "./sqlite-db.js";
import { result } from "../shared/result.js";

export const type = "sqlite_query";
export const yamlKey = "sqlite_query";

export function tryCompile(item) {
  if (!item.sqlite_query) return null;
  return { type, ...item.sqlite_query };
}

export async function verify(check, context) {
  const dbPath = join(context.workspace, check.dbPath);
  if (!existsSync(dbPath)) return result(false, `sqlite db not found: ${check.dbPath}`);
  const db = openReadonlyDatabase(dbPath);
  try {
    const rows = db.prepare(check.sql).all();
    const row = rows[check.row ?? 0];
    const actual = row ? row[check.column] : undefined;
    if (check.equals !== undefined) {
      return result(
        row !== undefined && String(actual) === String(check.equals),
        `row ${check.row ?? 0}.${check.column} = ${actual}`,
      );
    }
    if (check.minimum !== undefined) {
      return result(
        row !== undefined && Number(actual) >= check.minimum,
        `row ${check.row ?? 0}.${check.column} = ${actual}`,
      );
    }
    return result(rows.length > 0, `${rows.length} rows`);
  } finally {
    db.close();
  }
}
