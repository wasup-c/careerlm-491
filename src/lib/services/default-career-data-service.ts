import type {
  CurrentUserProvider,
} from "../auth/current-user-provider";

import {
  ConfiguredCurrentUserProvider,
} from "../auth/configured-current-user-provider";

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
    new ConfiguredCurrentUserProvider();

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
 * Runtime identity must be supplied explicitly through CAREERLM_USER_ID
 * until a production authentication/session provider replaces
 * ConfiguredCurrentUserProvider.
 *
 * External job searches use the public Jobicy provider by default. The
 * provider remains injectable so automated tests never require live network
 * access.
 */
export const careerDataService =
  createDefaultCareerDataService();