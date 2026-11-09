import {
    MAX_JOB_PREFERENCE_KEYWORDS_LENGTH,
    MAX_JOB_PREFERENCE_LOCATION_LENGTH,
  } from "./job-preferences-validation";
  
  import {
    PersistenceCorruptionError,
  } from "./errors";
  
  type UnknownRecord =
    Record<string, unknown>;
  
  const workplaceTypes =
    new Set([
      "remote",
      "hybrid",
      "on-site",
      "unspecified",
    ]);
  
  const employmentTypes =
    new Set([
      "full-time",
      "part-time",
      "contract",
      "temporary",
      "internship",
      "other",
    ]);
  
  const experienceLevels =
    new Set([
      "entry",
      "mid",
      "senior",
      "lead",
      "executive",
      "unspecified",
    ]);
  
  function fail(
    path: string,
    message: string
  ): never {
    throw new PersistenceCorruptionError(
      `${path}: ${message}`
    );
  }
  
  function requireRecord(
    value: unknown,
    path: string
  ): UnknownRecord {
    if (
      typeof value !==
        "object" ||
      value === null ||
      Array.isArray(
        value
      )
    ) {
      fail(
        path,
        "must be an object."
      );
    }
  
    return value as UnknownRecord;
  }
  
  function requireCanonicalString(
    value: unknown,
    path: string,
    maxLength?: number
  ): string {
    if (
      typeof value !==
      "string"
    ) {
      fail(
        path,
        "must be a string."
      );
    }
  
    const normalized =
      value.trim();
  
    if (!normalized) {
      fail(
        path,
        "must not be empty."
      );
    }
  
    if (
      value !==
      normalized
    ) {
      fail(
        path,
        "must not contain surrounding whitespace."
      );
    }
  
    if (
      maxLength !==
        undefined &&
      value.length >
        maxLength
    ) {
      fail(
        path,
        "exceeds the maximum supported length."
      );
    }
  
    return value;
  }
  
  function validateEnumArray(
    value: unknown,
    allowed:
      ReadonlySet<string>,
    path: string
  ): void {
    if (
      !Array.isArray(
        value
      )
    ) {
      fail(
        path,
        "must be an array."
      );
    }
  
    const seen =
      new Set<string>();
  
    value.forEach(
      (
        item,
        index
      ) => {
        const normalized =
          requireCanonicalString(
            item,
            `${path}[${index}]`
          );
  
        if (
          !allowed.has(
            normalized
          )
        ) {
          fail(
            `${path}[${index}]`,
            "contains an unsupported value."
          );
        }
  
        if (
          seen.has(
            normalized
          )
        ) {
          fail(
            path,
            `contains duplicate value "${normalized}".`
          );
        }
  
        seen.add(
          normalized
        );
      }
    );
  }
  
  function requireBoolean(
    value: unknown,
    path: string
  ): void {
    if (
      typeof value !==
      "boolean"
    ) {
      fail(
        path,
        "must be a boolean."
      );
    }
  }
  
  function requireIsoTimestamp(
    value: unknown,
    path: string
  ): string {
    const timestamp =
      requireCanonicalString(
        value,
        path
      );
  
    const parsed =
      new Date(
        timestamp
      );
  
    if (
      Number.isNaN(
        parsed.getTime()
      ) ||
      parsed.toISOString() !==
        timestamp
    ) {
      fail(
        path,
        "must be a valid ISO-8601 UTC timestamp."
      );
    }
  
    return timestamp;
  }
  
  /**
   * Validates a JobPreferencesRecord that has already been read from
   * persistent storage.
   *
   * Unlike incoming preference normalization, this function does not repair
   * malformed state. Corruption is rejected explicitly.
   */
  export function validatePersistedJobPreferencesRecord(
    value: unknown,
    expectedUserId: string,
    path: string
  ): void {
    const record =
      requireRecord(
        value,
        path
      );
  
    const userId =
      requireCanonicalString(
        record.userId,
        `${path}.userId`,
        128
      );
  
    if (
      userId !==
      expectedUserId
    ) {
      fail(
        `${path}.userId`,
        "does not match the owning user."
      );
    }
  
    if (
      record.schemaVersion !==
      1
    ) {
      fail(
        `${path}.schemaVersion`,
        "must equal 1."
      );
    }
  
    requireCanonicalString(
      record.keywords,
      `${path}.keywords`,
      MAX_JOB_PREFERENCE_KEYWORDS_LENGTH
    );
  
    if (
      record.location !==
      undefined
    ) {
      requireCanonicalString(
        record.location,
        `${path}.location`,
        MAX_JOB_PREFERENCE_LOCATION_LENGTH
      );
    }
  
    validateEnumArray(
      record.workplaceTypes,
      workplaceTypes,
      `${path}.workplaceTypes`
    );
  
    validateEnumArray(
      record.employmentTypes,
      employmentTypes,
      `${path}.employmentTypes`
    );
  
    validateEnumArray(
      record.experienceLevels,
      experienceLevels,
      `${path}.experienceLevels`
    );
  
    requireBoolean(
      record.useResumeForMatching,
      `${path}.useResumeForMatching`
    );
  
    requireBoolean(
      record.usePortfolioForMatching,
      `${path}.usePortfolioForMatching`
    );
  
    const createdAt =
      requireIsoTimestamp(
        record.createdAt,
        `${path}.createdAt`
      );
  
    const updatedAt =
      requireIsoTimestamp(
        record.updatedAt,
        `${path}.updatedAt`
      );
  
    if (
      Date.parse(
        updatedAt
      ) <
      Date.parse(
        createdAt
      )
    ) {
      fail(
        path,
        "updatedAt cannot be earlier than createdAt."
      );
    }
  }