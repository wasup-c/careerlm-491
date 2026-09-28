import { describe, expect, it } from "vitest";

import { generateRoadmap } from "@/lib/generateRoadmap";
import { mockRoadmap } from "@/lib/mockRoadmap";

import type { QuestionnaireResponse } from "@/types/career";

const createQuestionnaire = (
  overrides: Partial<QuestionnaireResponse> = {}
): QuestionnaireResponse => ({
  targetCareerRole: "Frontend Developer",
  experienceLevel: "beginner",
  targetTimeline: "6 months",
  preferredLearningStyle: "project-based",
  weeklyTimeCommitment: "5-10 hours",
  ...overrides,
});

describe("generateRoadmap", () => {
  it("generates a roadmap for valid questionnaire input", () => {
    const result = generateRoadmap(createQuestionnaire());

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected roadmap generation to succeed.");
    }

    expect(result.roadmap.targetRole).toBe("Frontend Developer");
    expect(result.roadmap.milestones).toHaveLength(
      mockRoadmap.milestones.length
    );
  });

  it("trims whitespace from the target career role", () => {
    const result = generateRoadmap(
      createQuestionnaire({
        targetCareerRole: "  Software Engineer  ",
      })
    );

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected roadmap generation to succeed.");
    }

    expect(result.roadmap.targetRole).toBe("Software Engineer");
  });

  it("creates a normalized roadmap id from the target role", () => {
    const result = generateRoadmap(
      createQuestionnaire({
        targetCareerRole: "Data Science & AI",
      })
    );

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected roadmap generation to succeed.");
    }

    expect(result.roadmap.id).toBe("roadmap-data-science-ai");
  });

  it("preserves the roadmap milestone structure", () => {
    const result = generateRoadmap(createQuestionnaire());

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected roadmap generation to succeed.");
    }

    expect(result.roadmap.milestones).toEqual(mockRoadmap.milestones);
  });

  it("creates independent milestone skill arrays", () => {
    const result = generateRoadmap(createQuestionnaire());

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected roadmap generation to succeed.");
    }

    result.roadmap.milestones.forEach((milestone, index) => {
      expect(milestone.skills).toEqual(
        mockRoadmap.milestones[index].skills
      );

      expect(milestone.skills).not.toBe(
        mockRoadmap.milestones[index].skills
      );
    });
  });

  it("returns a validation error when target career role is empty", () => {
    const result = generateRoadmap(
      createQuestionnaire({
        targetCareerRole: "",
      })
    );

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected roadmap generation to fail.");
    }

    expect(result.error.code).toBe("VALIDATION_ERROR");
    expect(result.error.fieldErrors?.targetCareerRole).toBe(
      "Target career role is required."
    );
  });

  it("returns a validation error when target role contains only whitespace", () => {
    const result = generateRoadmap(
      createQuestionnaire({
        targetCareerRole: "     ",
      })
    );

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected roadmap generation to fail.");
    }

    expect(result.error.code).toBe("VALIDATION_ERROR");
  });
});
