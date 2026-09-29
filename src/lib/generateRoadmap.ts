import { mockRoadmap } from "@/lib/mockRoadmap";

import type {
  CareerRoadmap,
  QuestionnaireResponse,
} from "@/types/career";

export function generateRoadmap(
  questionnaire: QuestionnaireResponse
): CareerRoadmap {
  const targetRole = questionnaire.targetCareerRole.trim();

  return {
    ...mockRoadmap,

    id: `roadmap-${targetRole
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`,

    targetRole,

    milestones: mockRoadmap.milestones.map((milestone) => ({
      ...milestone,
      skills: [...milestone.skills],
    })),
  };
}