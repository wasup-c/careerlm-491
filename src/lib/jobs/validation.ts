import type {
    JobEmploymentType,
    JobExperienceLevel,
    JobOpportunity,
    JobSalary,
    JobSalaryInterval,
    JobSearchQuery,
    JobWorkplaceType,
  } from "./domain";
  
  import {
    JobValidationError,
  } from "./errors";
  
  export const DEFAULT_JOB_RESULT_LIMIT =
    20;
  
  export const MAX_JOB_RESULT_LIMIT =
    50;
  
  export const MAX_JOB_QUERY_LENGTH =
    200;
  
  export const MAX_JOB_LOCATION_LENGTH =
    200;
  
  const workplaceTypes:
    readonly JobWorkplaceType[] =
      [
        "remote",
        "hybrid",
        "on-site",
        "unspecified",
      ];
  
  const employmentTypes:
    readonly JobEmploymentType[] =
      [
        "full-time",
        "part-time",
        "contract",
        "temporary",
        "internship",
        "other",
      ];
  
  const experienceLevels:
    readonly JobExperienceLevel[] =
      [
        "entry",
        "mid",
        "senior",
        "lead",
        "executive",
        "unspecified",
      ];
  
  const salaryIntervals:
    readonly JobSalaryInterval[] =
      [
        "hour",
        "day",
        "week",
        "month",
        "year",
      ];
  
  function requireRecord(
    value: unknown,
    fieldName: string
  ): Record<string, unknown> {
    if (
      typeof value !==
        "object" ||
      value === null ||
      Array.isArray(
        value
      )
    ) {
      throw new JobValidationError(
        `${fieldName} must be an object.`
      );
    }
  
    return value as Record<
      string,
      unknown
    >;
  }
  
  function requireString(
    value: unknown,
    fieldName: string
  ): string {
    if (
      typeof value !==
      "string"
    ) {
      throw new JobValidationError(
        `${fieldName} must be a string.`
      );
    }
  
    const normalized =
      value.trim();
  
    if (!normalized) {
      throw new JobValidationError(
        `${fieldName} is required.`
      );
    }
  
    return normalized;
  }
  
  function normalizeOptionalString(
    value: unknown,
    fieldName: string
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
      throw new JobValidationError(
        `${fieldName} must be a string.`
      );
    }
  
    const normalized =
      value.trim();
  
    return (
      normalized ||
      undefined
    );
  }
  
  function normalizeUrl(
    value: unknown,
    fieldName: string
  ): string {
    const normalized =
      requireString(
        value,
        fieldName
      );
  
    let parsed: URL;
  
    try {
      parsed =
        new URL(
          normalized
        );
    } catch {
      throw new JobValidationError(
        `${fieldName} must be a valid URL.`
      );
    }
  
    if (
      parsed.protocol !==
        "https:" &&
      parsed.protocol !==
        "http:"
    ) {
      throw new JobValidationError(
        `${fieldName} must use HTTP or HTTPS.`
      );
    }
  
    return parsed.toString();
  }
  
  function normalizeIsoTimestamp(
    value: unknown,
    fieldName: string
  ): string {
    const normalized =
      requireString(
        value,
        fieldName
      );
  
    const parsed =
      new Date(
        normalized
      );
  
    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      throw new JobValidationError(
        `${fieldName} must be a valid timestamp.`
      );
    }
  
    return parsed.toISOString();
  }
  
  function normalizeOptionalIsoTimestamp(
    value: unknown,
    fieldName: string
  ): string | undefined {
    if (
      value === undefined ||
      value === null
    ) {
      return undefined;
    }
  
    return normalizeIsoTimestamp(
      value,
      fieldName
    );
  }
  
  function normalizeStringArray(
    value: unknown,
    fieldName: string
  ): string[] {
    if (
      value === undefined ||
      value === null
    ) {
      return [];
    }
  
    if (
      !Array.isArray(
        value
      )
    ) {
      throw new JobValidationError(
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
            throw new JobValidationError(
              `${fieldName}[${index}] must be a string.`
            );
          }
  
          return item.trim();
        }
      )
        .filter(
          Boolean
        );
  
    return Array.from(
      new Set(
        normalized
      )
    );
  }
  
  function normalizeOptionalEnum<
    T extends string,
  >(
    value: unknown,
    allowed:
      readonly T[],
    fieldName: string
  ): T | undefined {
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
      throw new JobValidationError(
        `${fieldName} must be a string.`
      );
    }
  
    if (
      !allowed.includes(
        value as T
      )
    ) {
      throw new JobValidationError(
        `${fieldName} has an unsupported value.`
      );
    }
  
    return value as T;
  }
  
  function normalizeEnumArray<
    T extends string,
  >(
    value: unknown,
    allowed:
      readonly T[],
    fieldName: string
  ): T[] {
    if (
      value === undefined ||
      value === null
    ) {
      return [];
    }
  
    if (
      !Array.isArray(
        value
      )
    ) {
      throw new JobValidationError(
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
            throw new JobValidationError(
              `${fieldName}[${index}] must be a string.`
            );
          }
  
          if (
            !allowed.includes(
              item as T
            )
          ) {
            throw new JobValidationError(
              `${fieldName}[${index}] has an unsupported value.`
            );
          }
  
          return item as T;
        }
      );
  
    return Array.from(
      new Set(
        normalized
      )
    );
  }
  
  function normalizeOptionalMoney(
    value: unknown,
    fieldName: string
  ): number | undefined {
    if (
      value === undefined ||
      value === null
    ) {
      return undefined;
    }
  
    if (
      typeof value !==
        "number" ||
      !Number.isFinite(
        value
      ) ||
      value < 0
    ) {
      throw new JobValidationError(
        `${fieldName} must be a non-negative finite number.`
      );
    }
  
    return value;
  }
  
  function normalizeSalary(
    value: unknown
  ): JobSalary | undefined {
    if (
      value === undefined ||
      value === null
    ) {
      return undefined;
    }
  
    const data =
      requireRecord(
        value,
        "Job salary"
      );
  
    const min =
      normalizeOptionalMoney(
        data.min,
        "Job salary minimum"
      );
  
    const max =
      normalizeOptionalMoney(
        data.max,
        "Job salary maximum"
      );
  
    if (
      min !== undefined &&
      max !== undefined &&
      min > max
    ) {
      throw new JobValidationError(
        "Job salary minimum cannot exceed the maximum."
      );
    }
  
    const currency =
      normalizeOptionalString(
        data.currency,
        "Job salary currency"
      )
        ?.toUpperCase();
  
    const interval =
      normalizeOptionalEnum(
        data.interval,
        salaryIntervals,
        "Job salary interval"
      );
  
    const salary:
      JobSalary = {};
  
    if (
      min !== undefined
    ) {
      salary.min = min;
    }
  
    if (
      max !== undefined
    ) {
      salary.max = max;
    }
  
    if (
      currency !==
      undefined
    ) {
      salary.currency =
        currency;
    }
  
    if (
      interval !==
      undefined
    ) {
      salary.interval =
        interval;
    }
  
    return salary;
  }
  
  /**
   * Normalizes an untrusted job-provider result into CareerLM's canonical job
   * opportunity contract.
   */
  export function normalizeJobOpportunity(
    input: unknown
  ): JobOpportunity {
    const data =
      requireRecord(
        input,
        "Job opportunity"
      );
  
    const providerJobId =
      requireString(
        data.providerJobId,
        "Provider job ID"
      );
  
    const title =
      requireString(
        data.title,
        "Job title"
      );
  
    const company =
      requireString(
        data.company,
        "Job company"
      );
  
    const location =
      normalizeOptionalString(
        data.location,
        "Job location"
      );
  
    const workplaceType =
      normalizeOptionalEnum(
        data.workplaceType,
        workplaceTypes,
        "Job workplace type"
      ) ??
      "unspecified";
  
    const description =
      normalizeOptionalString(
        data.description,
        "Job description"
      );
  
    const employmentType =
      normalizeOptionalEnum(
        data.employmentType,
        employmentTypes,
        "Job employment type"
      );
  
    const experienceLevel =
      normalizeOptionalEnum(
        data.experienceLevel,
        experienceLevels,
        "Job experience level"
      );
  
    const skills =
      normalizeStringArray(
        data.skills,
        "Job skills"
      );
  
    const salary =
      normalizeSalary(
        data.salary
      );
  
    const applicationUrl =
      normalizeUrl(
        data.applicationUrl,
        "Job application URL"
      );
  
    const source =
      requireString(
        data.source,
        "Job source"
      );
  
    const postedAt =
      normalizeOptionalIsoTimestamp(
        data.postedAt,
        "Job posting timestamp"
      );
  
    const retrievedAt =
      data.retrievedAt ===
        undefined ||
      data.retrievedAt ===
        null
        ? new Date()
            .toISOString()
        : normalizeIsoTimestamp(
            data.retrievedAt,
            "Job retrieval timestamp"
          );
  
    const opportunity:
      JobOpportunity = {
        providerJobId,
  
        title,
  
        company,
  
        workplaceType,
  
        skills,
  
        applicationUrl,
  
        source,
  
        retrievedAt,
      };
  
    if (
      location !==
      undefined
    ) {
      opportunity.location =
        location;
    }
  
    if (
      description !==
      undefined
    ) {
      opportunity.description =
        description;
    }
  
    if (
      employmentType !==
      undefined
    ) {
      opportunity.employmentType =
        employmentType;
    }
  
    if (
      experienceLevel !==
      undefined
    ) {
      opportunity.experienceLevel =
        experienceLevel;
    }
  
    if (
      salary !==
      undefined
    ) {
      opportunity.salary =
        salary;
    }
  
    if (
      postedAt !==
      undefined
    ) {
      opportunity.postedAt =
        postedAt;
    }
  
    return opportunity;
  }
  
  /**
   * Normalizes an application-facing job search request before it reaches a
   * JobProvider implementation.
   */
  export function normalizeJobSearchQuery(
    input: unknown
  ): JobSearchQuery {
    const data =
      requireRecord(
        input,
        "Job search query"
      );
  
    const keywords =
      requireString(
        data.keywords,
        "Job search keywords"
      );
  
    if (
      keywords.length >
      MAX_JOB_QUERY_LENGTH
    ) {
      throw new JobValidationError(
        `Job search keywords cannot exceed ${MAX_JOB_QUERY_LENGTH} characters.`
      );
    }
  
    const location =
      normalizeOptionalString(
        data.location,
        "Job search location"
      );
  
    if (
      location !==
        undefined &&
      location.length >
        MAX_JOB_LOCATION_LENGTH
    ) {
      throw new JobValidationError(
        `Job search location cannot exceed ${MAX_JOB_LOCATION_LENGTH} characters.`
      );
    }
  
    const workplaceTypesValue =
      normalizeEnumArray(
        data.workplaceTypes,
        workplaceTypes,
        "Job workplace types"
      );
  
    const employmentTypesValue =
      normalizeEnumArray(
        data.employmentTypes,
        employmentTypes,
        "Job employment types"
      );
  
    const experienceLevelsValue =
      normalizeEnumArray(
        data.experienceLevels,
        experienceLevels,
        "Job experience levels"
      );
  
    const rawLimit =
      data.limit;
  
    const limit =
      rawLimit ===
        undefined ||
      rawLimit ===
        null
        ? DEFAULT_JOB_RESULT_LIMIT
        : rawLimit;
  
    if (
      typeof limit !==
        "number" ||
      !Number.isInteger(
        limit
      ) ||
      limit < 1 ||
      limit >
        MAX_JOB_RESULT_LIMIT
    ) {
      throw new JobValidationError(
        `Job search result limit must be an integer between 1 and ${MAX_JOB_RESULT_LIMIT}.`
      );
    }
  
    const query:
      JobSearchQuery = {
        keywords,
  
        workplaceTypes:
          workplaceTypesValue,
  
        employmentTypes:
          employmentTypesValue,
  
        experienceLevels:
          experienceLevelsValue,
  
        limit,
      };
  
    if (
      location !==
      undefined
    ) {
      query.location =
        location;
    }
  
    return query;
  }