import {
    readdir,
    readFile,
  } from "node:fs/promises";
  import path from "node:path";
  import {
    fileURLToPath,
  } from "node:url";
  
  import pg from "pg";
  
  const { Client } = pg;
  
  const databaseUrl =
    process.env.DATABASE_URL?.trim();
  
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required to run CareerLM database migrations."
    );
  }
  
  const currentFile =
    fileURLToPath(import.meta.url);
  
  const currentDirectory =
    path.dirname(currentFile);
  
  const projectRoot =
    path.resolve(
      currentDirectory,
      ".."
    );
  
  const migrationsDirectory =
    path.join(
      projectRoot,
      "database",
      "migrations"
    );
  
  const client =
    new Client({
      connectionString:
        databaseUrl,
    });
  
  async function ensureMigrationTable() {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }
  
  async function getMigrationFiles() {
    const entries =
      await readdir(
        migrationsDirectory
      );
  
    return entries
      .filter(
        (entry) =>
          /^\d+.*\.sql$/.test(
            entry
          )
      )
      .sort();
  }
  
  async function getAppliedMigrations() {
    const result =
      await client.query(
        `
          SELECT name
          FROM schema_migrations
        `
      );
  
    return new Set(
      result.rows.map(
        (row) => row.name
      )
    );
  }
  
  async function applyMigration(
    fileName
  ) {
    const migrationPath =
      path.join(
        migrationsDirectory,
        fileName
      );
  
    const sql =
      await readFile(
        migrationPath,
        "utf8"
      );
  
    await client.query("BEGIN");
  
    try {
      await client.query(sql);
  
      await client.query(
        `
          INSERT INTO schema_migrations (
            name
          )
          VALUES ($1)
        `,
        [fileName]
      );
  
      await client.query(
        "COMMIT"
      );
  
      console.log(
        `Applied migration: ${fileName}`
      );
    } catch (error) {
      await client.query(
        "ROLLBACK"
      );
  
      throw error;
    }
  }
  
  async function runMigrations() {
    await client.connect();
  
    try {
      await ensureMigrationTable();
  
      const migrationFiles =
        await getMigrationFiles();
  
      const appliedMigrations =
        await getAppliedMigrations();
  
      for (
        const fileName
        of migrationFiles
      ) {
        if (
          appliedMigrations.has(
            fileName
          )
        ) {
          console.log(
            `Skipping already applied migration: ${fileName}`
          );
  
          continue;
        }
  
        await applyMigration(
          fileName
        );
      }
  
      console.log(
        "CareerLM database migrations are up to date."
      );
    } finally {
      await client.end();
    }
  }
  
  await runMigrations();