import type {
    CurrentUserProvider,
  } from "../auth/current-user-provider";
  
  import {
    DemoCurrentUserProvider,
  } from "../auth/demo-current-user-provider";
  
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
    currentUserProvider?: CurrentUserProvider;
    repository?: CareerRepository;
  }
  
  /**
   * Creates CareerLM's default session-aware data service.
   *
   * Application/API code should consume CareerDataService rather than
   * constructing persistence and current-user dependencies itself.
   *
   * Dependency overrides keep the composition boundary testable without
   * changing production defaults.
   */
  export function createDefaultCareerDataService(
    options:
      CareerDataServiceCompositionOptions = {}
  ): CareerDataService {
    const currentUserProvider =
      options.currentUserProvider ??
      new DemoCurrentUserProvider();
  
    const repository =
      options.repository ??
      careerRepository;
  
    return new CareerDataService(
      repository,
      currentUserProvider
    );
  }
  
  /**
   * Default application-level service used by CareerLM server-side code.
   *
   * Current behavior:
   * - identity comes from DemoCurrentUserProvider
   * - persistence comes from the shared careerRepository
   *
   * Either dependency can later be replaced behind its existing interface.
   */
  export const careerDataService =
    createDefaultCareerDataService();