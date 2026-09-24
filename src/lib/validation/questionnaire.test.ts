import { describe, expect, it } from "vitest";
import { validateQuestionnaire } from "./questionnaire";

const validQuestionnaire = {
  targetCareerRole: "Software Engineer",
  experienceLevel: "Beginner (little to no experience)",

  // Replace these two with exact values from your onboarding form.
  targetTimeline: "3-6 months",
  preferredLearningStyle: "Hands-on projects",

  weeklyTimeCommitment: "5-10 hours",
};

describe("validateQuestionnaire", () => {
  it("accepts a valid questionnaire", () => {
    const result = validateQuestionnaire(validQuestionnaire);

    expect(result.valid).toBe(true);

    if (result.valid) {
      expect(result.data).toEqual(validQuestionnaire);
    }
  });

  it("rejects a missing target career role", () => {
    const result = validateQuestionnaire({
      ...validQuestionnaire,
      targetCareerRole: "",
    });

    expect(result.valid).toBe(false);

    if (!result.valid) {
      expect(result.fieldErrors.targetCareerRole).toBe(
        "Target career role is required."
      );
    }
  });

  it("rejects a whitespace-only target career role", () => {
    const result = validateQuestionnaire({
      ...validQuestionnaire,
      targetCareerRole: "   ",
    });

    expect(result.valid).toBe(false);

    if (!result.valid) {
      expect(result.fieldErrors.targetCareerRole).toBeDefined();
    }
  });

  it("rejects an unsupported experience level", () => {
    const result = validateQuestionnaire({
      ...validQuestionnaire,
      experienceLevel: "Expert",
    });

    expect(result.valid).toBe(false);

    if (!result.valid) {
      expect(result.fieldErrors.experienceLevel).toBe(
        "Experience level is invalid."
      );
    }
  });

  it("accepts all supported experience levels", () => {
    const supportedExperienceLevels = [
      "Beginner (little to no experience)",
      "Intermediate (some coursework/projects)",
      "Advanced (professional or extensive project experience)",
    ];

    for (const experienceLevel of supportedExperienceLevels) {
      const result = validateQuestionnaire({
        ...validQuestionnaire,
        experienceLevel,
      });

      expect(result.valid).toBe(true);
    }
  });

  it("rejects an unsupported target timeline", () => {
    const result = validateQuestionnaire({
      ...validQuestionnaire,
      targetTimeline: "Someday",
    });

    expect(result.valid).toBe(false);

    if (!result.valid) {
      expect(result.fieldErrors.targetTimeline).toBe(
        "Target timeline is invalid."
      );
    }
  });

  it("rejects an empty target timeline", () => {
    const result = validateQuestionnaire({
      ...validQuestionnaire,
      targetTimeline: "",
    });

    expect(result.valid).toBe(false);

    if (!result.valid) {
      expect(result.fieldErrors.targetTimeline).toBeDefined();
    }
  });

  it("rejects an unsupported preferred learning style", () => {
    const result = validateQuestionnaire({
      ...validQuestionnaire,
      preferredLearningStyle: "Whatever works",
    });

    expect(result.valid).toBe(false);

    if (!result.valid) {
      expect(result.fieldErrors.preferredLearningStyle).toBe(
        "Preferred learning style is invalid."
      );
    }
  });

  it("rejects an empty preferred learning style", () => {
    const result = validateQuestionnaire({
      ...validQuestionnaire,
      preferredLearningStyle: "",
    });

    expect(result.valid).toBe(false);

    if (!result.valid) {
      expect(
        result.fieldErrors.preferredLearningStyle
      ).toBeDefined();
    }
  });

  it("accepts all supported weekly time commitments", () => {
    const supportedWeeklyTimeCommitments = [
      "Less than 5 hours",
      "5-10 hours",
      "10-20 hours",
      "More than 20 hours",
    ];

    for (const weeklyTimeCommitment of supportedWeeklyTimeCommitments) {
      const result = validateQuestionnaire({
        ...validQuestionnaire,
        weeklyTimeCommitment,
      });

      expect(result.valid).toBe(true);
    }
  });

  it("rejects an unsupported weekly time commitment", () => {
    const result = validateQuestionnaire({
      ...validQuestionnaire,
      weeklyTimeCommitment: "30 hours",
    });

    expect(result.valid).toBe(false);

    if (!result.valid) {
      expect(result.fieldErrors.weeklyTimeCommitment).toBe(
        "Weekly time commitment is invalid."
      );
    }
  });

  it("rejects a numeric weekly time commitment", () => {
    const result = validateQuestionnaire({
      ...validQuestionnaire,
      weeklyTimeCommitment: 10,
    });

    expect(result.valid).toBe(false);

    if (!result.valid) {
      expect(result.fieldErrors.weeklyTimeCommitment).toBeDefined();
    }
  });

  it("rejects null input", () => {
    const result = validateQuestionnaire(null);

    expect(result.valid).toBe(false);
  });

  it("rejects array input", () => {
    const result = validateQuestionnaire([]);

    expect(result.valid).toBe(false);
  });

  it("rejects a string instead of a questionnaire object", () => {
    const result = validateQuestionnaire("invalid questionnaire");

    expect(result.valid).toBe(false);
  });

  it("returns multiple field errors when multiple fields are invalid", () => {
    const result = validateQuestionnaire({
      ...validQuestionnaire,
      targetCareerRole: "",
      experienceLevel: "Invalid level",
      targetTimeline: "Invalid timeline",
      preferredLearningStyle: "Invalid style",
      weeklyTimeCommitment: "100 hours",
    });

    expect(result.valid).toBe(false);

    if (!result.valid) {
      expect(result.fieldErrors.targetCareerRole).toBeDefined();
      expect(result.fieldErrors.experienceLevel).toBeDefined();
      expect(result.fieldErrors.targetTimeline).toBeDefined();
      expect(
        result.fieldErrors.preferredLearningStyle
      ).toBeDefined();
      expect(result.fieldErrors.weeklyTimeCommitment).toBeDefined();
    }
  });
});