import type {
    PersistenceState,
  } from "./domain";
  
  import {
    PersistenceCorruptionError,
  } from "./errors";
  
  type UnknownRecord =
    Record<string, unknown>;
  
  const experienceLevels =
    new Set([
      "beginner",
      "intermediate",
      "advanced",
    ]);
  
  const milestoneStatuses =
    new Set([
      "not-started",
      "in-progress",
      "completed",
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
      typeof value !== "object" ||
      value === null ||
      Array.isArray(value)
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
    path: string
  ): string {
    if (
      typeof value !== "string"
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
  
    if (value !== normalized) {
      fail(
        path,
        "must not contain surrounding whitespace."
      );
    }
  
    return value;
  }
  
  function requireStoredUserId(
    value: unknown,
    path: string
  ): string {
    const userId =
      requireCanonicalString(
        value,
        path
      );
  
    if (userId.length > 128) {
      fail(
        path,
        "exceeds the maximum supported length."
      );
    }
  
    return userId;
  }
  
  function requirePositiveInteger(
    value: unknown,
    path: string
  ): number {
    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < 1
    ) {
      fail(
        path,
        "must be a positive integer."
      );
    }
  
    return value;
  }
  
  function requireNonNegativeNumber(
    value: unknown,
    path: string
  ): number {
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < 0
    ) {
      fail(
        path,
        "must be a finite non-negative number."
      );
    }
  
    return value;
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
      new Date(timestamp);
  
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
  
  function validateTimestampOrder(
    createdAt: string,
    updatedAt: string,
    path: string
  ): void {
    if (
      Date.parse(updatedAt) <
      Date.parse(createdAt)
    ) {
      fail(
        path,
        "updatedAt cannot be earlier than createdAt."
      );
    }
  }
  
  function validateCanonicalStringArray(
    value: unknown,
    path: string
  ): void {
    if (!Array.isArray(value)) {
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
          seen.has(normalized)
        ) {
          fail(
            path,
            `contains duplicate value "${normalized}".`
          );
        }
  
        seen.add(normalized);
      }
    );
  }
  
  function validateAdditionalResponses(
    value: unknown,
    path: string
  ): void {
    const responses =
      requireRecord(
        value,
        path
      );
  
    for (
      const [
        key,
        response,
      ] of Object.entries(
        responses
      )
    ) {
      const responsePath =
        `${path}.${key}`;
  
      if (
        response === null ||
        typeof response ===
          "string" ||
        typeof response ===
          "boolean"
      ) {
        continue;
      }
  
      if (
        typeof response ===
          "number" &&
        Number.isFinite(response)
      ) {
        continue;
      }
  
      if (
        Array.isArray(response) &&
        response.every(
          (item) =>
            typeof item ===
            "string"
        )
      ) {
        continue;
      }
  
      fail(
        responsePath,
        "contains an unsupported persisted response value."
      );
    }
  }
  
  function validateQuestionnaireRecord(
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
      requireStoredUserId(
        record.userId,
        `${path}.userId`
      );
  
    if (
      userId !== expectedUserId
    ) {
      fail(
        `${path}.userId`,
        "does not match the owning user."
      );
    }
  
    if (
      record.schemaVersion !== 1
    ) {
      fail(
        `${path}.schemaVersion`,
        "must equal 1."
      );
    }
  
    requireCanonicalString(
      record.targetRole,
      `${path}.targetRole`
    );
  
    if (
      typeof record.experienceLevel !==
        "string" ||
      !experienceLevels.has(
        record.experienceLevel
      )
    ) {
      fail(
        `${path}.experienceLevel`,
        "contains an unsupported experience level."
      );
    }
  
    validateCanonicalStringArray(
      record.existingSkills,
      `${path}.existingSkills`
    );
  
    requireCanonicalString(
      record.learningStyle,
      `${path}.learningStyle`
    );
  
    if (
      typeof record.weeklyHours !==
        "number" ||
      !Number.isFinite(
        record.weeklyHours
      ) ||
      record.weeklyHours <= 0 ||
      record.weeklyHours > 168
    ) {
      fail(
        `${path}.weeklyHours`,
        "must be greater than 0 and no greater than 168."
      );
    }
  
    if (
      record.additionalResponses !==
      undefined
    ) {
      validateAdditionalResponses(
        record.additionalResponses,
        `${path}.additionalResponses`
      );
    }
  
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
  
    validateTimestampOrder(
      createdAt,
      updatedAt,
      path
    );
  }
  
  function validateMilestoneRecord(
    value: unknown,
    path: string
  ): {
    id: string;
    order: number;
  } {
    const record =
      requireRecord(
        value,
        path
      );
  
    const id =
      requireCanonicalString(
        record.id,
        `${path}.id`
      );
  
    const order =
      requirePositiveInteger(
        record.order,
        `${path}.order`
      );
  
    requireCanonicalString(
      record.title,
      `${path}.title`
    );
  
    requireCanonicalString(
      record.description,
      `${path}.description`
    );
  
    requireNonNegativeNumber(
      record.estimatedHours,
      `${path}.estimatedHours`
    );
  
    validateCanonicalStringArray(
      record.skills,
      `${path}.skills`
    );
  
    if (
      typeof record.status !==
        "string" ||
      !milestoneStatuses.has(
        record.status
      )
    ) {
      fail(
        `${path}.status`,
        "contains an unsupported milestone status."
      );
    }
  
    return {
      id,
      order,
    };
  }
  
  function validateRoadmapRecord(
    value: unknown,
    expectedUserId: string,
    path: string
  ): void {
    const record =
      requireRecord(
        value,
        path
      );
  
    requireCanonicalString(
      record.id,
      `${path}.id`
    );
  
    const userId =
      requireStoredUserId(
        record.userId,
        `${path}.userId`
      );
  
    if (
      userId !== expectedUserId
    ) {
      fail(
        `${path}.userId`,
        "does not match the owning user."
      );
    }
  
    requireCanonicalString(
      record.title,
      `${path}.title`
    );
  
    requireCanonicalString(
      record.targetRole,
      `${path}.targetRole`
    );
  
    requirePositiveInteger(
      record.estimatedWeeks,
      `${path}.estimatedWeeks`
    );
  
    if (
      !Array.isArray(
        record.milestones
      ) ||
      record.milestones.length === 0
    ) {
      fail(
        `${path}.milestones`,
        "must contain at least one milestone."
      );
    }
  
    const ids =
      new Set<string>();
  
    const orders =
      new Set<number>();
  
    let previousOrder:
      number | null = null;
  
    record.milestones.forEach(
      (
        milestone,
        index
      ) => {
        const result =
          validateMilestoneRecord(
            milestone,
            `${path}.milestones[${index}]`
          );
  
        if (
          ids.has(result.id)
        ) {
          fail(
            `${path}.milestones`,
            `contains duplicate milestone ID "${result.id}".`
          );
        }
  
        if (
          orders.has(result.order)
        ) {
          fail(
            `${path}.milestones`,
            `contains duplicate milestone order ${result.order}.`
          );
        }
  
        if (
          previousOrder !== null &&
          result.order <
            previousOrder
        ) {
          fail(
            `${path}.milestones`,
            "must remain sorted by milestone order."
          );
        }
  
        ids.add(result.id);
        orders.add(result.order);
  
        previousOrder =
          result.order;
      }
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
  
    validateTimestampOrder(
      createdAt,
      updatedAt,
      path
    );
  }
  
  function validateUserState(
    value: unknown,
    userId: string,
    path: string
  ): void {
    const userState =
      requireRecord(
        value,
        path
      );
  
    if (
      userState.questionnaire !==
      undefined
    ) {
      validateQuestionnaireRecord(
        userState.questionnaire,
        userId,
        `${path}.questionnaire`
      );
    }
  
    if (
      userState.activeRoadmap !==
      undefined
    ) {
      validateRoadmapRecord(
        userState.activeRoadmap,
        userId,
        `${path}.activeRoadmap`
      );
    }
  }
  
  /**
   * Validates data that has already been persisted by CareerLM.
   *
   * Persisted state is intentionally validated more strictly than incoming
   * application input. The reader does not normalize or repair corrupted
   * storage silently; invalid persisted records produce a controlled
   * PersistenceCorruptionError instead.
   */
  export function validatePersistenceState(
    value: unknown
  ): PersistenceState {
    const state =
      requireRecord(
        value,
        "persistence"
      );
  
    if (
      state.schemaVersion !== 1
    ) {
      fail(
        "persistence.schemaVersion",
        "contains an unsupported schema version."
      );
    }
  
    const users =
      requireRecord(
        state.users,
        "persistence.users"
      );
  
    for (
      const [
        rawUserId,
        userState,
      ] of Object.entries(users)
    ) {
      const userId =
        requireStoredUserId(
          rawUserId,
          `persistence.users["${rawUserId}"]`
        );
  
      validateUserState(
        userState,
        userId,
        `persistence.users["${userId}"]`
      );
    }
  
    return value as PersistenceState;
  }