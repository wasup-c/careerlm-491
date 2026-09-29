export const ONBOARDING_STORAGE_KEY =
  "careerlm-onboarding-answers";

export type StoredOnboardingAnswers = {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string[];
};

function isNonEmptyString(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

export function isValidOnboardingAnswers(
  value: unknown,
): value is StoredOnboardingAnswers {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const answers = value as Record<string, unknown>;

  const hasValidSingleResponses =
    isNonEmptyString(answers["1"]) &&
    isNonEmptyString(answers["2"]) &&
    isNonEmptyString(answers["3"]) &&
    isNonEmptyString(answers["4"]);

  const learningPreferences = answers["5"];

  const hasValidLearningPreferences =
    Array.isArray(learningPreferences) &&
    learningPreferences.length > 0 &&
    learningPreferences.every(isNonEmptyString);

  return (
    hasValidSingleResponses &&
    hasValidLearningPreferences
  );
}

export function readOnboardingAnswers(
  storage: Pick<Storage, "getItem">,
): StoredOnboardingAnswers | null {
  const storedAnswers = storage.getItem(
    ONBOARDING_STORAGE_KEY,
  );

  if (!storedAnswers) {
    return null;
  }

  try {
    const parsedAnswers: unknown =
      JSON.parse(storedAnswers);

    if (!isValidOnboardingAnswers(parsedAnswers)) {
      return null;
    }

    return parsedAnswers;
  } catch {
    return null;
  }
}