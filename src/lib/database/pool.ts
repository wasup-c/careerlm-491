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
  
  let modulePool:
    Pool | undefined;
  
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
   * Lazily creates and reuses the CareerLM PostgreSQL connection pool.
   *
   * Keeping pool creation lazy allows the persistence module to be
   * imported when DATABASE_URL is not configured so CareerLM can still
   * use its legacy JSON fallback during the migration period.
   */
  export function getPostgresPool():
    Pool {
    if (
      globalDatabase
        .careerLmPostgresPool
    ) {
      modulePool =
        globalDatabase
          .careerLmPostgresPool;
  
      return modulePool;
    }
  
    if (modulePool) {
      return modulePool;
    }
  
    modulePool =
      createPool();
  
    if (
      process.env.NODE_ENV !==
      "production"
    ) {
      globalDatabase
        .careerLmPostgresPool =
        modulePool;
    }
  
    return modulePool;
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
    return getPostgresPool()
      .query<Row>(
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
    return getPostgresPool()
      .connect();
  }
  
  /**
   * Closes the shared pool.
   *
   * Intended primarily for tests or explicit process cleanup.
   */
  export async function closeDatabase():
    Promise<void> {
    const pool =
      modulePool ??
      globalDatabase
        .careerLmPostgresPool;
  
    if (!pool) {
      return;
    }
  
    await pool.end();
  
    if (
      globalDatabase
        .careerLmPostgresPool ===
      pool
    ) {
      delete globalDatabase
        .careerLmPostgresPool;
    }
  
    modulePool =
      undefined;
  }