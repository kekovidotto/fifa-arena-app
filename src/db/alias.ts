import { alias as pgAlias } from "drizzle-orm/pg-core";
import { alias as sqliteAlias } from "drizzle-orm/sqlite-core";

import { isSqliteDatabaseUrl } from "./driver";
import * as pg from "./schema-pg";
import * as sqlite from "./schema-sqlite";

/** Self-join de `players` (home/away) compatível com PostgreSQL e SQLite. */
export function aliasPlayers(aliasName: string) {
  return isSqliteDatabaseUrl()
    ? sqliteAlias(sqlite.players, aliasName)
    : pgAlias(pg.players, aliasName);
}
