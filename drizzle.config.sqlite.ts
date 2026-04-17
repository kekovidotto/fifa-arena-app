import "dotenv/config";

import { defineConfig } from "drizzle-kit";

import { sqliteFilePathFromDatabaseUrl } from "./src/db/driver";

const url = process.env.DATABASE_URL ?? "";
const sqlitePath = url.startsWith("file:")
  ? sqliteFilePathFromDatabaseUrl(url)
  : "./dev.db";

export default defineConfig({
  out: "./drizzle-sqlite",
  schema: "./src/db/schema-sqlite.ts",
  dialect: "sqlite",
  dbCredentials: { url: sqlitePath },
});
