import type {
    MilestoneInput,
    QuestionnaireInput,
    RoadmapInput,
  } from "./domain";
  
  import { PersistenceValidationError } from "./errors";
  
  export function normalizeUserId(userId: string): string {
    const normalized = userId.trim();
  
    if (!normalized) {
      throw new PersistenceValidationError(
        "A valid user ID is required."
      );
    }
  
    if (normalized.length > 128) {
      throw new PersistenceValidationError(
        "User ID exceeds the maximum supported length."
      );
    }
  
    return normalized;
  }
  
  function requireNonEmptyString(
    value: string,
    fieldName: string
  ): string {
    const normalized = value.trim();
  
    if (!normalized) {
      throw new PersistenceValidationError(
        `${fieldName} is required.`
      );
    }
  
    return normalized;
  }
  
  export function normalizeQuestionnaire(
    input: QuestionnaireInput
  ): QuestionnaireInput {
    const targetRole = requireNonEmptyString(
      input.targetRole,
      "Target role"
    );
  
    const learningStyle = requireNonEmptyString(
      input.learningStyle,
      "Learning style"
    );
  
    const allowedExperienceLevels = new Set([
      "beginner",
      "intermediate",
      "advanced",
    ]);
  
    if (!allowedExperienceLevels.has(input.experienceLevel)) {
      throw new PersistenceValidationError(
        "Experience level must be beginner, intermediate, or advanced."
      );
    }
  
    if (
      !Number.isFinite(input.weeklyHours) ||
      input.weeklyHours <= 0 ||
      input.weeklyHours > 168
    ) {
      throw new PersistenceValidationError(
        "Weekly hours must be greater than 0 and no greater than 168."
      );
    }
  
    if (!Array.isArray(input.existingSkills)) {
      throw new PersistenceValidationError(
        "Existing skills must be an array."
      );
    }
  
    const existingSkills = Array.from(
      new Set(
        input.existingSkills
          .map((skill) => skill.trim())
          .filter(Boolean)
      )
    );
  
    return {
      targetRole,
      experienceLevel: input.experienceLevel,
      existingSkills,
      learningStyle,
      weeklyHours: input.weeklyHours,
      additionalResponses: input.additionalResponses
        ? { ...input.additionalResponses }
        : undefined,
    };
  }
  
  function normalizeMilestone(
    milestone: MilestoneInput
  ): MilestoneInput {
    if (
      !Number.isInteger(milestone.order) ||
      milestone.order < 1
    ) {
      throw new PersistenceValidationError(
        "Milestone order must be a positive integer."
      );
    }
  
    if (
      !Number.isFinite(milestone.estimatedHours) ||
      milestone.estimatedHours < 0
    ) {
      throw new PersistenceValidationError(
        "Milestone estimated hours cannot be negative."
      );
    }
  
    const allowedStatuses = new Set([
      "not-started",
      "in-progress",
      "completed",
    ]);
  
    if (!allowedStatuses.has(milestone.status)) {
      throw new PersistenceValidationError(
        `Invalid milestone status: ${milestone.status}`
      );
    }
  
    return {
      id: milestone.id?.trim() || undefined,
  
      order: milestone.order,
  
      title: requireNonEmptyString(
        milestone.title,
        "Milestone title"
      ),
  
      description: requireNonEmptyString(
        milestone.description,
        "Milestone description"
      ),
  
      estimatedHours: milestone.estimatedHours,
  
      skills: Array.from(
        new Set(
          milestone.skills
            .map((skill) => skill.trim())
            .filter(Boolean)
        )
      ),
  
      status: milestone.status,
    };
  }
  
  export function normalizeRoadmap(
    input: RoadmapInput
  ): RoadmapInput {
    if (
      !Number.isInteger(input.estimatedWeeks) ||
      input.estimatedWeeks < 1
    ) {
      throw new PersistenceValidationError(
        "Estimated weeks must be a positive integer."
      );
    }
  
    if (
      !Array.isArray(input.milestones) ||
      input.milestones.length === 0
    ) {
      throw new PersistenceValidationError(
        "A roadmap must contain at least one milestone."
      );
    }
  
    const milestones = input.milestones.map(normalizeMilestone);
  
    const orders = milestones.map(
      (milestone) => milestone.order
    );
  
    if (new Set(orders).size !== orders.length) {
      throw new PersistenceValidationError(
        "Roadmap milestone order values must be unique."
      );
    }
  
    const providedIds = milestones
      .map((milestone) => milestone.id)
      .filter((id): id is string => Boolean(id));
  
    if (new Set(providedIds).size !== providedIds.length) {
      throw new PersistenceValidationError(
        "Roadmap milestone IDs must be unique."
      );
    }
  
    return {
      title: requireNonEmptyString(
        input.title,
        "Roadmap title"
      ),
  
      targetRole: requireNonEmptyString(
        input.targetRole,
        "Roadmap target role"
      ),
  
      estimatedWeeks: input.estimatedWeeks,
  
      milestones: milestones.sort(
        (left, right) => left.order - right.order
      ),
    };
  }