import path from "node:path";

import {
  getPostgresPool,
} from "../database/pool";

import {
  JsonFileCareerRepository,
} from "./json-file-repository";

import {
  PostgresCareerRepository,
} from "./postgres-career-repository";

import type {
  CareerRepository,
} from "./repository";

const globalRepository =
  globalThis as typeof globalThis & {
    careerRepository?:
      CareerRepository;
  };

/**
 * Creates CareerLM's runtime persistence repository.
 *
 * PostgreSQL is selected when DATABASE_URL is configured.
 * Otherwise CareerLM retains the legacy JSON repository as a
 * migration/development fallback.
 */
export function createCareerRepository():
  CareerRepository {
  const databaseUrl =
    process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    return new PostgresCareerRepository(
      getPostgresPool()
    );
  }

  const configuredPath =
    process.env.CAREERLM_DATA_FILE?.trim();

  const persistencePath =
    configuredPath ||
    path.join(
      process.cwd(),
      ".careerlm",
      "data.json"
    );

  return new JsonFileCareerRepository(
    persistencePath
  );
}

/**
 * Reuses the repository instance during Next.js development hot reloads.
 *
 * This keeps repository identity and mutation behavior stable across
 * repeated module evaluation during local development.
 */
export const careerRepository =
  globalRepository
    .careerRepository ??
  createCareerRepository();

if (
  process.env.NODE_ENV !==
  "production"
) {
  globalRepository
    .careerRepository =
    careerRepository;
}

export type {
  CareerRepository,
} from "./repository";

export * from "./domain";

export {
  PersistenceCorruptionError,
  PersistenceNotFoundError,
  PersistenceValidationError,
} from "./errors";

export {
  InMemoryCareerRepository,
} from "./in-memory-repository";

export {
  JsonFileCareerRepository,
} from "./json-file-repository";

export {
  PostgresCareerRepository,
} from "./postgres-career-repository";