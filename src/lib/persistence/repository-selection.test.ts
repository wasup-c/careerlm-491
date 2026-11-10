import {
    afterEach,
    describe,
    expect,
    it,
  } from "vitest";
  
  import {
    closeDatabase,
  } from "../database/pool";
  
  import {
    createCareerRepository,
  } from "./index";
  
  import {
    JsonFileCareerRepository,
  } from "./json-file-repository";
  
  import {
    PostgresCareerRepository,
  } from "./postgres-career-repository";
  
  const originalDatabaseUrl =
    process.env.DATABASE_URL;
  
  afterEach(async () => {
    if (
      originalDatabaseUrl ===
      undefined
    ) {
      delete process.env
        .DATABASE_URL;
    } else {
      process.env.DATABASE_URL =
        originalDatabaseUrl;
    }
  
    await closeDatabase();
  });
  
  describe(
    "CareerLM repository selection",
    () => {
      it(
        "uses JSON persistence when DATABASE_URL is absent",
        () => {
          delete process.env
            .DATABASE_URL;
  
          const repository =
            createCareerRepository();
  
          expect(
            repository
          ).toBeInstanceOf(
            JsonFileCareerRepository
          );
        }
      );
  
      it(
        "uses PostgreSQL persistence when DATABASE_URL is configured",
        () => {
          process.env.DATABASE_URL =
            "postgresql://example:example@localhost:5432/careerlm";
  
          const repository =
            createCareerRepository();
  
          expect(
            repository
          ).toBeInstanceOf(
            PostgresCareerRepository
          );
        }
      );
    }
  );