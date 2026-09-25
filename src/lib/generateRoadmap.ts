<<<<<<< HEAD
import type {
  CareerRoadmap,
  QuestionnaireResponses,
} from "@/types/career";

function createRoadmapId(targetRole: string): string {
  const slug = targetRole
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `roadmap-${slug || "career-goal"}`;
}

/**
 * Creates a deterministic roadmap from questionnaire responses.
 *
 * Sprint 1 uses local deterministic behavior.
 * A later sprint can replace this implementation with an AI-backed
 * roadmap-generation service while preserving the same shared types.
 */
export function generateRoadmap(
  responses: QuestionnaireResponses
): CareerRoadmap {
  const targetRole =
    responses.targetRole.trim() || "Career Goal";

  const weeklyHours = Math.max(
    responses.weeklyHours,
    1
  );

  const milestones = [
    {
      id: "career-foundations",
      order: 1,
      title: `Build Foundations for ${targetRole}`,
      description:
        `Develop the fundamental knowledge needed to begin progressing toward a career as a ${targetRole}.`,
      estimatedHours: 20,
      skills:
        responses.existingSkills.length > 0
          ? responses.existingSkills
          : [
              "Core Fundamentals",
              "Problem Solving",
            ],
      status: "not-started" as const,
    },

    {
      id: "practical-skills",
      order: 2,
      title: "Develop Practical Skills",
      description:
        `Apply foundational knowledge through hands-on work related to ${targetRole}.`,
      estimatedHours: 30,
      skills: [
        "Practical Experience",
        "Project Development",
        "Problem Solving",
      ],
      status: "not-started" as const,
    },

    {
      id: "portfolio-project",
      order: 3,
      title: `Complete a ${targetRole} Portfolio Project`,
      description:
        "Create a complete project that demonstrates your developing skills and can be shown to employers.",
      estimatedHours: 40,
      skills: [
        "Project Planning",
        "Implementation",
        "Documentation",
        "Git",
        "GitHub",
      ],
      status: "not-started" as const,
      additionalInfo:
        "Document the project and explain the skills demonstrated by your work.",
    },
  ];

  const totalHours = milestones.reduce(
    (sum, milestone) =>
      sum + milestone.estimatedHours,
    0
  );

  return {
    id: createRoadmapId(targetRole),
    title: `${targetRole} Career Roadmap`,
    targetRole,
    estimatedWeeks: Math.ceil(
      totalHours / weeklyHours
    ),
    milestones,
  };
}
=======
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
>>>>>>> 22c3181449c5ed915be6454f6f1212059d3306cc
