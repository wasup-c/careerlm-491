import type { QuestionnaireResponse, WeeklyTimeCommitment } from "@/types/career";

export type QuestionnaireFieldErrors =
  Partial<Record<keyof QuestionnaireResponse, string>>;

export type QuestionnaireValidationResult =
  | {
      valid: true;
      data: QuestionnaireResponse;
    }
  | {
      valid: false;
      fieldErrors: QuestionnaireFieldErrors;
    };


// ========================================
// Allowed questionnaire values
// ========================================

const VALID_EXPERIENCE_LEVELS = [
  "Beginner (little to no experience)",
  "Intermediate (some coursework/projects)",
  "Advanced (professional or extensive project experience)",
] as const;

const VALID_TARGET_TIMELINES = [
  "Less than 3 months",
  "3-6 months",
  "6-12 months",
  "More than a year",
  "I'm not sure yet"
] as const;

const VALID_LEARNING_STYLES = [
  "Structured curriculum",
   "Hands-on projects",
      "Mentorship and guidance",
      "Community support",
      "Flexibility to learn at my own pace",
      "Building strong foundational knowledge",
      "Networking opportunities",
      "Access to industry insights and trends",
      "Exploring multiple areas before specializing"
] as const;

const VALID_WEEKLY_TIME_COMMITMENTS: readonly WeeklyTimeCommitment[] = [
  "Less than 5 hours",
  "5-10 hours",
  "10-20 hours",
  "More than 20 hours",
];


// ========================================
// Individual validation helpers
// ========================================

function isValidExperienceLevel(value: unknown): value is string {
  return (
    typeof value === "string" &&
    VALID_EXPERIENCE_LEVELS.includes(
      value as (typeof VALID_EXPERIENCE_LEVELS)[number]
    )
  );
}

function isValidTargetTimeline(value: unknown): value is string {
  return (
    typeof value === "string" &&
    VALID_TARGET_TIMELINES.includes(
      value as (typeof VALID_TARGET_TIMELINES)[number]
    )
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidPreferredLearningStyle(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    VALID_LEARNING_STYLES.includes(
      value as (typeof VALID_LEARNING_STYLES)[number]
    )
  );
}

function isValidWeeklyTimeCommitment(
  value: unknown
): value is WeeklyTimeCommitment {
  return (
    typeof value === "string" &&
    VALID_WEEKLY_TIME_COMMITMENTS.includes(
      value as WeeklyTimeCommitment
    )
  );
}

export function validateQuestionnaire(
  input: unknown
): QuestionnaireValidationResult {
  if (
    typeof input !== "object" ||
    input === null ||
    Array.isArray(input)
  ) {
    return {
      valid: false,
      fieldErrors: {
        targetCareerRole: "Questionnaire data is invalid.",
      },
    };
  }

  const data = input as Record<string, unknown>;

  const fieldErrors: QuestionnaireFieldErrors = {};

  if (!isNonEmptyString(data.targetCareerRole)) {
    fieldErrors.targetCareerRole =
      "Target career role is required.";
  }

  if (!isValidExperienceLevel(data.experienceLevel)) {
    fieldErrors.experienceLevel =
      "Experience level is invalid.";
  }

  if (!isValidTargetTimeline(data.targetTimeline)) {
  fieldErrors.targetTimeline =
    "Target timeline is invalid.";
  }

    if (!isValidPreferredLearningStyle(data.preferredLearningStyle)) {
    fieldErrors.preferredLearningStyle =
        "Preferred learning style is invalid.";
    }
  if (!isValidWeeklyTimeCommitment(data.weeklyTimeCommitment)) {
    fieldErrors.weeklyTimeCommitment =
      "Weekly time commitment is invalid.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      valid: false,
      fieldErrors,
    };
  }

  return {
    valid: true,
    data: {
      targetCareerRole: data.targetCareerRole as string,
      experienceLevel: data.experienceLevel as string,
      targetTimeline: data.targetTimeline as string,
      preferredLearningStyle: data.preferredLearningStyle as string,
      weeklyTimeCommitment: data.weeklyTimeCommitment as WeeklyTimeCommitment,
    },
  };
}