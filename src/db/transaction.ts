import { db } from "./client";
import * as schema from "./schema";
import { handleDatabaseError } from "@/lib/errors";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";

export type DrizzleDb = typeof db;

export type DrizzleTx = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

/**
 * Union type for any function that can execute either against the primary
 * database instance or inside an active transaction.
 */
export type DbOrTx = DrizzleDb | DrizzleTx;

/**
 * Executes an operation inside a PostgreSQL database transaction with automatic
 * commit/rollback and standard error translation.
 *
 * @param callback The asynchronous function to execute within the transaction context.
 * @param existingTx Optional existing transaction to reuse. If provided, nests within it.
 */
export async function withTransaction<T>(
  callback: (tx: DbOrTx) => Promise<T>,
  existingTx?: DbOrTx
): Promise<T> {
  if (existingTx) {
    // Already in a transaction context, execute directly
    try {
      return await callback(existingTx);
    } catch (error) {
      handleDatabaseError(error, "Nested transaction execution");
    }
  }

  try {
    return await db.transaction(async (tx) => {
      return await callback(tx);
    });
  } catch (error) {
    handleDatabaseError(error, "Transaction execution");
  }
}
