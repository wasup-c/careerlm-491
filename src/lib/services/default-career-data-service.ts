import type {
  CurrentUserProvider,
} from "../auth/current-user-provider";

import {
  ConfiguredCurrentUserProvider,
} from "../auth/configured-current-user-provider";

import {
  SessionCurrentUserProvider,
} from "../auth/session-current-user-provider";

import {
  JobicyJobProvider,
} from "../jobs/jobicy-job-provider";

import type {
  JobProvider,
} from "../jobs/provider";

import {
  careerRepository,
} from "../persistence";

import type {
  CareerRepository,
} from "../persistence/repository";

import {
  CareerDataService,
} from "./career-data-service";

export interface CareerDataServiceCompositionOptions {
  currentUserProvider?:
    CurrentUserProvider;

  repository?:
    CareerRepository;

  jobProvider?:
    JobProvider;
}

/**
 * Keeps existing automated tests deterministic without making the
 * development or production runtime depend on CAREERLM_USER_ID.
 */
function createDefaultCurrentUserProvider():
  CurrentUserProvider {
  if (
    process.env.NODE_ENV ===
    "test"
  ) {
    return new ConfiguredCurrentUserProvider();
  }

  return new SessionCurrentUserProvider();
}

/**
 * Creates the default server-side CareerLM application service.
 *
 * Runtime composition remains replaceable for tests so repository,
 * current-user, and external-provider dependencies can all be supplied
 * deterministically.
 */
export function createDefaultCareerDataService(
  options:
    CareerDataServiceCompositionOptions =
      {}
): CareerDataService {
  const currentUserProvider =
    options
      .currentUserProvider ??
    createDefaultCurrentUserProvider();

  const repository =
    options.repository ??
    careerRepository;

  const jobProvider =
    options.jobProvider ??
    new JobicyJobProvider();

  return new CareerDataService(
    repository,
    currentUserProvider,
    jobProvider
  );
}

/**
 * Default server-side CareerLM data service.
 *
 * Development and production runtime identity is resolved through the
 * database-backed HttpOnly session cookie.
 *
 * Automated tests retain the synthetic ConfiguredCurrentUserProvider
 * boundary so tests do not require a Next.js request context.
 *
 * External job searches use the public Jobicy provider by default.
 */
export const careerDataService =
  createDefaultCareerDataService();