import {
    describe,
    expect,
    it,
  } from "vitest";
  
  const hasDatabaseUrl =
    Boolean(
      process.env.DATABASE_URL?.trim()
    );
  
  const describeDatabase =
    hasDatabaseUrl
      ? describe
      : describe.skip;
  
  describeDatabase(
    "CareerLM PostgreSQL connection",
    () => {
      it(
        "connects using DATABASE_URL and reaches the configured database",
        async () => {
          const {
            closeDatabase,
            queryDatabase,
          } = await import(
            "./pool"
          );
  
          try {
            const result =
              await queryDatabase<{
                current_user: string;
                current_database: string;
              }>(
                `
                  SELECT
                    current_user,
                    current_database()
                `
              );
  
            expect(
              result.rows
            ).toHaveLength(1);
  
            expect(
              result.rows[0]
                .current_user
            ).toBe(
              "careerlm_app"
            );
  
            expect(
              result.rows[0]
                .current_database
            ).toBe(
              "careerlm_dev"
            );
          } finally {
            await closeDatabase();
          }
        }
      );
    }
  );