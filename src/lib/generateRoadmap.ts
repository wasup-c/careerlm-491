import { mockRoadmap } from "@/lib/mockRoadmap";

import type {
  GenerateRoadmapResponse,
  QuestionnaireResponse,
} from "@/types/career";

export function generateRoadmap(
  questionnaire: QuestionnaireResponse
): GenerateRoadmapResponse {
  const targetRole =
    questionnaire.targetCareerRole.trim();

  if (!targetRole) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message:
          "A target career role is required to generate a roadmap.",
        fieldErrors: {
          targetCareerRole:
            "Target career role is required.",
        },
      },
    };
  }

  return {
    success: true,
    roadmap: {
      ...mockRoadmap,

      id: `roadmap-${targetRole
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`,

      targetRole,

      milestones: mockRoadmap.milestones.map(
        (milestone) => ({
          ...milestone,
          skills: [...milestone.skills],
        })
      ),
    },
  };
}
