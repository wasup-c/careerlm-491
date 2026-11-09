import type {
    JobEmploymentType,
    JobExperienceLevel,
    JobWorkplaceType,
  } from "../jobs/domain";
  
  import type {
    JobPreferencesInput,
  } from "./domain";
  
  import {
    PersistenceValidationError,
  } from "./errors";
  
  export const MAX_JOB_PREFERENCE_KEYWORDS_LENGTH =
    200;
  
  export const MAX_JOB_PREFERENCE_LOCATION_LENGTH =
    200;
  
  const allowedWorkplaceTypes =
    new Set<JobWorkplaceType>([
      "remote",
      "hybrid",
      "on-site",
      "unspecified",
    ]);
  
  const allowedEmploymentTypes =
    new Set<JobEmploymentType>([
      "full-time",
      "part-time",
      "contract",
      "temporary",
      "internship",
      "other",
    ]);
  
  const allowedExperienceLevels =
    new Set<JobExperienceLevel>([
      "entry",
      "mid",
      "senior",
      "lead",
      "executive",
      "unspecified",
    ]);
  
  function requireString(
    value: unknown,
    fieldName: string,
    maxLength: number
  ): string {
    if (
      typeof value !==
      "string"
    ) {
      throw new PersistenceValidationError(
        `${fieldName} must be a string.`
      );
    }
  
    const normalized =
      value.trim();
  
    if (!normalized) {
      throw new PersistenceValidationError(
        `${fieldName} is required.`
      );
    }
  
    if (
      normalized.length >
      maxLength
    ) {
      throw new PersistenceValidationError(
        `${fieldName} exceeds the maximum supported length.`
      );
    }
  
    return normalized;
  }
  
  function optionalString(
    value: unknown,
    fieldName: string,
    maxLength: number
  ): string | undefined {
    if (
      value === undefined ||
      value === null
    ) {
      return undefined;
    }
  
    if (
      typeof value !==
      "string"
    ) {
      throw new PersistenceValidationError(
        `${fieldName} must be a string.`
      );
    }
  
    const normalized =
      value.trim();
  
    if (!normalized) {
      return undefined;
    }
  
    if (
      normalized.length >
      maxLength
    ) {
      throw new PersistenceValidationError(
        `${fieldName} exceeds the maximum supported length.`
      );
    }
  
    return normalized;
  }
  
  function normalizeEnumArray<
    T extends string,
  >(
    value: unknown,
    allowed: ReadonlySet<T>,
    fieldName: string
  ): T[] {
    if (
      !Array.isArray(
        value
      )
    ) {
      throw new PersistenceValidationError(
        `${fieldName} must be an array.`
      );
    }
  
    const normalized =
      value.map(
        (
          item,
          index
        ) => {
          if (
            typeof item !==
            "string"
          ) {
            throw new PersistenceValidationError(
              `${fieldName}[${index}] must be a string.`
            );
          }
  
          const trimmed =
            item.trim();
  
          if (
            !allowed.has(
              trimmed as T
            )
          ) {
            throw new PersistenceValidationError(
              `${fieldName}[${index}] has an unsupported value.`
            );
          }
  
          return trimmed as T;
        }
      );
  
    return Array.from(
      new Set(
        normalized
      )
    );
  }
  
  function requireBoolean(
    value: unknown,
    fieldName: string
  ): boolean {
    if (
      typeof value !==
      "boolean"
    ) {
      throw new PersistenceValidationError(
        `${fieldName} must be a boolean.`
      );
    }
  
    return value;
  }
  
  /**
   * Normalizes user-owned job-search preferences before persistence.
   *
   * Provider-specific fields do not belong here. These preferences describe
   * what the CareerLM user wants, independently of whichever external job
   * provider is currently configured.
   */
  export function normalizeJobPreferences(
    input: JobPreferencesInput
  ): JobPreferencesInput {
    if (
      typeof input !==
        "object" ||
      input === null ||
      Array.isArray(
        input
      )
    ) {
      throw new PersistenceValidationError(
        "Job preferences must be an object."
      );
    }
  
    const keywords =
      requireString(
        input.keywords,
        "Job preference keywords",
        MAX_JOB_PREFERENCE_KEYWORDS_LENGTH
      );
  
    const location =
      optionalString(
        input.location,
        "Job preference location",
        MAX_JOB_PREFERENCE_LOCATION_LENGTH
      );
  
    const workplaceTypes =
      normalizeEnumArray(
        input.workplaceTypes,
        allowedWorkplaceTypes,
        "Job preference workplace types"
      );
  
    const employmentTypes =
      normalizeEnumArray(
        input.employmentTypes,
        allowedEmploymentTypes,
        "Job preference employment types"
      );
  
    const experienceLevels =
      normalizeEnumArray(
        input.experienceLevels,
        allowedExperienceLevels,
        "Job preference experience levels"
      );
  
    const useResumeForMatching =
      requireBoolean(
        input.useResumeForMatching,
        "Use resume for matching"
      );
  
    const usePortfolioForMatching =
      requireBoolean(
        input.usePortfolioForMatching,
        "Use portfolio for matching"
      );
  
    const normalized:
      JobPreferencesInput = {
        keywords,
        workplaceTypes,
        employmentTypes,
        experienceLevels,
        useResumeForMatching,
        usePortfolioForMatching,
      };
  
    if (
      location !==
      undefined
    ) {
      normalized.location =
        location;
    }
  
    return normalized;
  }