import path from "node:path";

import { JsonFileCareerRepository } from "./json-file-repository";

import type { CareerRepository } from "./repository";

const globalRepository =
  globalThis as typeof globalThis & {
    careerRepository?: CareerRepository;
  };

function createRepository(): CareerRepository {
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
 * This keeps mutation serialization behavior stable across repeated
 * module evaluation during local development.
 */
export const careerRepository =
  globalRepository.careerRepository ??
  createRepository();

if (process.env.NODE_ENV !== "production") {
  globalRepository.careerRepository =
    careerRepository;
}

export type { CareerRepository } from "./repository";

export * from "./domain";

export {
  PersistenceCorruptionError,
  PersistenceNotFoundError,
  PersistenceValidationError,
} from "./errors";