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
