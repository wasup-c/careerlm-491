import { describe, expect, it } from "vitest";

import { generateRoadmap } from "@/lib/generateRoadmap";
import { mockRoadmap } from "@/lib/mockRoadmap";

import type { RoadmapInput } from "@/lib/persistence/domain";
import type { QuestionnaireResponse } from "@/types/career";

const createQuestionnaire = (
  overrides: Partial<QuestionnaireResponse> = {}
): QuestionnaireResponse => ({
  targetCareerRole: "Frontend Developer",
  experienceLevel: "beginner",
  targetTimeline: "6 months",
  preferredLearningStyle: ["project-based"],
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
    expect(result.roadmap.title.trim()).not.toBe("");
    expect(result.roadmap.estimatedWeeks).toBeGreaterThan(0);
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

  it("preserves shared roadmap metadata from the roadmap template", () => {
    const result = generateRoadmap(createQuestionnaire());

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected roadmap generation to succeed.");
    }

    expect(result.roadmap.title).toBe(mockRoadmap.title);
    expect(result.roadmap.estimatedWeeks).toBe(
      mockRoadmap.estimatedWeeks
    );
  });

  it("preserves milestone order and required shared fields", () => {
    const result = generateRoadmap(createQuestionnaire());

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected roadmap generation to succeed.");
    }

    result.roadmap.milestones.forEach((milestone, index) => {
      const sourceMilestone = mockRoadmap.milestones[index];

      expect(milestone.order).toBe(sourceMilestone.order);
      expect(milestone.title).toBe(sourceMilestone.title);
      expect(milestone.description).toBe(
        sourceMilestone.description
      );
      expect(milestone.estimatedHours).toBe(
        sourceMilestone.estimatedHours
      );
      expect(milestone.skills).toEqual(sourceMilestone.skills);
      expect(milestone.status).toBe(sourceMilestone.status);
    });
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

  it("produces roadmap data compatible with the persistence contract", () => {
    const result = generateRoadmap(createQuestionnaire());

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected roadmap generation to succeed.");
    }

    const persistenceCompatibleRoadmap: RoadmapInput =
      result.roadmap;

    expect(persistenceCompatibleRoadmap.targetRole).toBe(
      "Frontend Developer"
    );
    expect(persistenceCompatibleRoadmap.milestones.length).toBeGreaterThan(
      0
    );
  });

  it("does not store derived progress on generated roadmap data", () => {
    const result = generateRoadmap(createQuestionnaire());

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected roadmap generation to succeed.");
    }

    expect(result.roadmap).not.toHaveProperty(
      "progressPercentage"
    );
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
    expect(result.error.fieldErrors?.targetCareerRole).toBe(
      "Target career role is required."
    );
  });
});
