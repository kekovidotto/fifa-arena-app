import { db } from "@/db";
import { isSqliteDatabaseUrl } from "@/db/driver";

/**
 * Transação Drizzle em modo SQLite (`better-sqlite3`): encadeamento síncrono
 * com `.run()` / `.all()` / `.get()` no fim do builder.
 *
 * O retorno precisa ser permissivo: `@/db/schema` unifica tabelas com tipos de
 * coluna PostgreSQL, enquanto o driver SQLite usa outro conjunto de tipos Drizzle
 * — alinhar isso em TypeScript exigiria duplicar imports ou casts em massa.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ver JSDoc acima
export function asSqliteTx(tx: unknown): any {
  return tx;
}

/**
 * `better-sqlite3` não aceita `db.transaction(async (tx) => …)` — o callback
 * precisa ser síncrono e executar queries com `.run()` / `.all()` / `.get()`.
 * PostgreSQL segue com callback `async` e `await` normalmente.
 */
export async function runTransaction<T>(opts: {
  sqlite: (tx: unknown) => T;
  postgres: (tx: unknown) => Promise<T>;
}): Promise<T> {
  if (isSqliteDatabaseUrl()) {
    const sqliteDb = db as unknown as {
      transaction: <R>(fn: (tx: unknown) => R) => R;
    };
    return sqliteDb.transaction((tx) => opts.sqlite(tx));
  }
  return (await db.transaction(
    async (tx) => opts.postgres(tx),
  )) as unknown as T;
}
