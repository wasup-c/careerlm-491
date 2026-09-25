import type {
  Milestone,
  QuestionnaireInput,
  Roadmap,
} from "@/types/career";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateRoadmap(
  answers: QuestionnaireInput
): Roadmap {
  const targetRole =
    answers.targetRole.trim() || "Career Goal";

  const foundationSkills =
    answers.existingSkills.length > 0
      ? answers.existingSkills
      : [
          "Core Fundamentals",
          "Problem Solving",
        ];

  const milestones: Milestone[] = [
    {
      id: "foundation",
      order: 1,
      title: `Build Foundations for ${targetRole}`,
      description:
        `Develop the fundamental knowledge needed to begin progressing toward a career as a ${targetRole}.`,
      estimatedHours: 20,
      skills: foundationSkills,
      status: "not-started",
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
      status: "not-started",
    },
    {
      id: "career-project",
      order: 3,
      title: `Complete a ${targetRole} Portfolio Project`,
      description:
        "Create and document a complete project that demonstrates your developing skills to employers.",
      estimatedHours: 40,
      skills: [
        "Project Planning",
        "Implementation",
        "Documentation",
        "Git",
        "GitHub",
      ],
      status: "not-started",
    },
  ];

  const totalHours = milestones.reduce(
    (sum, milestone) =>
      sum + milestone.estimatedHours,
    0
  );

  const hoursPerWeek = Math.max(
    answers.weeklyHours,
    1
  );

  return {
    id: `roadmap-${
      slugify(targetRole) || "career-goal"
    }`,
    title: `${targetRole} Career Roadmap`,
    targetRole,
    estimatedWeeks: Math.ceil(
      totalHours / hoursPerWeek
    ),
    milestones,
  };
}
