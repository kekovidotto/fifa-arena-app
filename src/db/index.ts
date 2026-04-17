import "dotenv/config";

import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { isSqliteDatabaseUrl, sqliteFilePathFromDatabaseUrl } from "./driver";
import * as schemaPg from "./schema-pg";
import * as schemaSqlite from "./schema-sqlite";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL não está definida.");
  }

  if (isSqliteDatabaseUrl(url)) {
    const sqlite = new Database(sqliteFilePathFromDatabaseUrl(url));
    sqlite.pragma("foreign_keys = ON");
    return drizzleSqlite(sqlite, { schema: schemaSqlite });
  }

  const pool = new Pool({ connectionString: url });
  return drizzlePg(pool, { schema: schemaPg });
}

/**
 * Tipagem fixa ao dialect PostgreSQL para o código compilar; em dev com SQLite
 * o runtime usa better-sqlite3 (API compatível com `await` nos builders).
 */
export const db = createDb() as NodePgDatabase<typeof schemaPg>;

export { isSqliteDatabaseUrl } from "./driver";

/** Schema Drizzle ativo (para o adapter do better-auth). */
export const drizzleSchema = isSqliteDatabaseUrl()
  ? schemaSqlite
  : schemaPg;
