import {
  describe,
  expect,
  it,
} from "vitest";

import {
  isValidOnboardingAnswers,
  ONBOARDING_STORAGE_KEY,
  readOnboardingAnswers,
} from "./onboardingSession";

const validAnswers = {
  1: "Frontend Developer",
  2: "Intermediate (some coursework/projects)",
  3: "5-10 hours",
  4: "3-6 months",
  5: ["Hands-on projects"],
};

describe("onboardingSession", () => {
  it("accepts complete onboarding answers", () => {
    expect(
      isValidOnboardingAnswers(validAnswers),
    ).toBe(true);
  });

  it("rejects onboarding answers with missing questions", () => {
    expect(
      isValidOnboardingAnswers({
        1: "Frontend Developer",
        2: "Intermediate",
      }),
    ).toBe(false);
  });

  it("rejects an empty learning-preference selection", () => {
    expect(
      isValidOnboardingAnswers({
        ...validAnswers,
        5: [],
      }),
    ).toBe(false);
  });

  it("reads valid onboarding answers from storage", () => {
    const storage = {
      getItem: (key: string) =>
        key === ONBOARDING_STORAGE_KEY
          ? JSON.stringify(validAnswers)
          : null,
    };

    expect(readOnboardingAnswers(storage)).toEqual(
      validAnswers,
    );
  });

  it("returns null for malformed stored JSON", () => {
    const storage = {
      getItem: () => "not-valid-json",
    };

    expect(readOnboardingAnswers(storage)).toBeNull();
  });

  it("returns null when no stored answers exist", () => {
    const storage = {
      getItem: () => null,
    };

    expect(readOnboardingAnswers(storage)).toBeNull();
  });
});