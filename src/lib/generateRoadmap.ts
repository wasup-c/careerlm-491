import type {
  CareerRoadmap,
  OnboardingAnswers,
} from "@/types/career";

function findFirstTextAnswer(
  answers: OnboardingAnswers
): string | undefined {
  return Object.values(answers).find(
    (answer): answer is string =>
      typeof answer === "string" &&
      answer.trim().length > 0
  );
}

function findFirstListAnswer(
  answers: OnboardingAnswers
): string[] {
  const answer = Object.values(answers).find(
    (value): value is string[] =>
      Array.isArray(value) && value.length > 0
  );

  return answer ?? [];
}

export function generateRoadmap(
  answers: OnboardingAnswers
): CareerRoadmap {
  const targetRole =
    findFirstTextAnswer(answers) ?? "Career Goal";

  const selectedSkills = findFirstListAnswer(answers);

  return {
    id: `roadmap-${Date.now()}`,
    targetRole,
    progressPercentage: 0,

    milestones: [
      {
        id: "foundation",
        title: `Build Foundations for ${targetRole}`,
        description:
          `Develop the fundamental knowledge required to begin progressing toward a career as a ${targetRole}.`,
        skills:
          selectedSkills.length > 0
            ? selectedSkills
            : ["Core Fundamentals", "Problem Solving"],
        estimatedTime: "2-4 weeks",
        status: "not-started",
      },

      {
        id: "practical-skills",
        title: "Develop Practical Skills",
        description:
          `Apply foundational knowledge through hands-on work related to ${targetRole}.`,
        skills: [
          "Practical Experience",
          "Project Development",
          "Problem Solving",
        ],
        estimatedTime: "4-6 weeks",
        status: "not-started",
      },

      {
        id: "career-project",
        title: `Complete a ${targetRole} Portfolio Project`,
        description:
          "Create a complete project that demonstrates your developing skills and can be shown to employers.",
        skills: [
          "Project Planning",
          "Implementation",
          "Documentation",
          "Git",
          "GitHub",
        ],
        estimatedTime: "6-8 weeks",
        status: "not-started",
        additionalInfo:
          "Document the project and explain the skills demonstrated by your work.",
      },
    ],
  };
}
