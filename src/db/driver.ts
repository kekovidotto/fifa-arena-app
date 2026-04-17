/**
 * Desenvolvimento local com SQLite: defina `DATABASE_URL=file:./dev.db` (ou outro caminho).
 * Produção: URL PostgreSQL (ex.: postgres://...).
 */
export function isSqliteDatabaseUrl(url?: string): boolean {
  const u = url ?? process.env.DATABASE_URL ?? "";
  return u.startsWith("file:");
}

export function sqliteFilePathFromDatabaseUrl(url?: string): string {
  const u = url ?? process.env.DATABASE_URL ?? "";
  if (!u.startsWith("file:")) {
    throw new Error("DATABASE_URL deve começar com file: para SQLite.");
  }
  return u.slice("file:".length);
}
