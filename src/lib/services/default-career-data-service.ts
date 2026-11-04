import type {
  CurrentUserProvider,
} from "../auth/current-user-provider";

import {
  ConfiguredCurrentUserProvider,
} from "../auth/configured-current-user-provider";

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
}

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

  return new CareerDataService(
    repository,
    currentUserProvider
  );
}

/**
 * Default server-side CareerLM data service.
 *
 * Runtime identity must now be supplied explicitly through
 * CAREERLM_USER_ID until a production authentication/session provider
 * replaces ConfiguredCurrentUserProvider.
 */
export const careerDataService =
  createDefaultCareerDataService();