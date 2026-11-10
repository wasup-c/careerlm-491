import {
    Pool,
    type PoolClient,
    type QueryResult,
    type QueryResultRow,
  } from "pg";
  
  const globalDatabase =
    globalThis as typeof globalThis & {
      careerLmPostgresPool?: Pool;
    };
  
  function getDatabaseUrl(): string {
    const databaseUrl =
      process.env.DATABASE_URL?.trim();
  
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL is required to use CareerLM PostgreSQL persistence."
      );
    }
  
    return databaseUrl;
  }
  
  function createPool(): Pool {
    return new Pool({
      connectionString:
        getDatabaseUrl(),
    });
  }
  
  /**
   * Reuse one PostgreSQL connection pool during Next.js development
   * hot reloads.
   *
   * Without this global reuse, repeated module evaluation can create
   * unnecessary connection pools while running `next dev`.
   */
  export const postgresPool =
    globalDatabase.careerLmPostgresPool ??
    createPool();
  
  if (
    process.env.NODE_ENV !==
    "production"
  ) {
    globalDatabase.careerLmPostgresPool =
      postgresPool;
  }
  
  /**
   * Executes a query through the shared CareerLM PostgreSQL pool.
   */
  export async function queryDatabase<
    Row extends QueryResultRow =
      QueryResultRow,
  >(
    text: string,
    values: readonly unknown[] = []
  ): Promise<QueryResult<Row>> {
    return postgresPool.query<Row>(
      text,
      [...values]
    );
  }
  
  /**
   * Provides a dedicated PostgreSQL client for transaction-based work.
   *
   * Callers are responsible for releasing the client.
   */
  export async function getDatabaseClient():
    Promise<PoolClient> {
    return postgresPool.connect();
  }
  
  /**
   * Closes the shared pool.
   *
   * Intended primarily for tests or explicit process cleanup.
   */
  export async function closeDatabase():
    Promise<void> {
    await postgresPool.end();
  
    if (
      globalDatabase.careerLmPostgresPool ===
      postgresPool
    ) {
      delete globalDatabase.careerLmPostgresPool;
    }
  }