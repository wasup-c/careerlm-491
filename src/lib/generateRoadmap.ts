import type {
  GenerateRoadmapResponse,
  QuestionnaireResponse,
  WeeklyTimeCommitment,
} from "@/types/career";

type ExperienceBand =
  | "beginner"
  | "intermediate"
  | "advanced";

function resolveExperienceBand(
  value: string
): ExperienceBand {
  const normalized =
    value.toLowerCase();

  if (
    normalized.includes(
      "advanced"
    )
  ) {
    return "advanced";
  }

  if (
    normalized.includes(
      "intermediate"
    )
  ) {
    return "intermediate";
  }

  return "beginner";
}

function resolveWeeklyHours(
  commitment:
    WeeklyTimeCommitment
): number {
  switch (commitment) {
    case "Less than 5 hours":
      return 3;

    case "5-10 hours":
      return 8;

    case "10-20 hours":
      return 15;

    case "More than 20 hours":
      return 24;
  }
}

function resolveEstimatedWeeks(
  timeline: string
): number {
  switch (
    timeline.trim()
  ) {
    case "Less than 3 months":
      return 8;

    case "3-6 months":
      return 16;

    case "6-12 months":
      return 32;

    case "More than a year":
      return 52;

    default:
      return 24;
  }
}

function resolveRoleSkills(
  targetRole: string
): string[] {
  const role =
    targetRole
      .toLowerCase();

  if (
    role.includes(
      "front"
    ) ||
    role.includes(
      "react"
    )
  ) {
    return [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
    ];
  }

  if (
    role.includes(
      "back"
    ) ||
    role.includes(
      "api"
    )
  ) {
    return [
      "API Design",
      "Databases",
      "Server-Side Development",
      "Testing",
      "Deployment",
    ];
  }

  if (
    role.includes(
      "security"
    ) ||
    role.includes(
      "cyber"
    )
  ) {
    return [
      "Networking",
      "Linux",
      "Security Fundamentals",
      "Threat Analysis",
      "Security Testing",
    ];
  }

  if (
    role.includes(
      "data"
    )
  ) {
    return [
      "Python",
      "SQL",
      "Statistics",
      "Data Analysis",
      "Data Visualization",
    ];
  }

  if (
    role.includes(
      "machine learning"
    ) ||
    role.includes(
      " ai"
    ) ||
    role.startsWith(
      "ai"
    )
  ) {
    return [
      "Python",
      "Statistics",
      "Machine Learning",
      "Model Evaluation",
      "Deployment",
    ];
  }

  if (
    role.includes(
      "cloud"
    ) ||
    role.includes(
      "devops"
    )
  ) {
    return [
      "Cloud Fundamentals",
      "Linux",
      "Containers",
      "CI/CD",
      "Infrastructure Automation",
    ];
  }

  return [
    "Role Fundamentals",
    "Industry Tools",
    "Applied Practice",
    "Problem Solving",
    "Professional Communication",
  ];
}

function buildMilestoneHours(
  totalHours: number
): [
  number,
  number,
  number,
  number,
] {
  return [
    Math.max(
      4,
      Math.round(
        totalHours * 0.2
      )
    ),

    Math.max(
      6,
      Math.round(
        totalHours * 0.3
      )
    ),

    Math.max(
      8,
      Math.round(
        totalHours * 0.3
      )
    ),

    Math.max(
      4,
      Math.round(
        totalHours * 0.2
      )
    ),
  ];
}

export function generateRoadmap(
  questionnaire:
    QuestionnaireResponse
): GenerateRoadmapResponse {
  const targetRole =
    questionnaire
      .targetCareerRole
      .trim();

  if (!targetRole) {
    return {
      success: false,

      error: {
        code:
          "VALIDATION_ERROR",

        message:
          "A target career role is required to generate a roadmap.",

        fieldErrors: {
          targetCareerRole:
            "Target career role is required.",
        },
      },
    };
  }

  const experience =
    resolveExperienceBand(
      questionnaire
        .experienceLevel
    );

  const weeklyHours =
    resolveWeeklyHours(
      questionnaire
        .weeklyTimeCommitment
    );

  const estimatedWeeks =
    resolveEstimatedWeeks(
      questionnaire
        .targetTimeline
    );

  const learningStyle =
    questionnaire
      .preferredLearningStyle[0] ??
    "structured practice";

  const roleSkills =
    resolveRoleSkills(
      targetRole
    );

  const totalLearningHours =
    Math.max(
      24,

      Math.min(
        180,

        Math.round(
          weeklyHours *
            estimatedWeeks *
            0.35
        )
      )
    );

  const [
    foundationHours,
    coreHours,
    projectHours,
    readinessHours,
  ] =
    buildMilestoneHours(
      totalLearningHours
    );

  const foundationTitle =
    experience ===
    "beginner"
      ? `Build ${targetRole} foundations`
      : experience ===
          "intermediate"
        ? `Assess and strengthen ${targetRole} fundamentals`
        : `Identify advanced ${targetRole} skill gaps`;

  return {
    success: true,

    roadmap: {
      title:
        `${targetRole} Career Roadmap`,

      targetRole,

      estimatedWeeks,

      milestones: [
        {
          id:
            "foundation",

          order: 1,

          title:
            foundationTitle,

          description:
            `Establish the knowledge baseline needed for ${targetRole}. Use ${learningStyle.toLowerCase()} to focus on the highest-value gaps for your current experience level.`,

          estimatedHours:
            foundationHours,

          skills:
            roleSkills.slice(
              0,
              2
            ),

          status:
            "not-started",
        },

        {
          id:
            "core-skills",

          order: 2,

          title:
            `Develop core ${targetRole} skills`,

          description:
            `Build practical capability in the technologies and competencies commonly associated with ${targetRole} work.`,

          estimatedHours:
            coreHours,

          skills:
            roleSkills.slice(
              1,
              4
            ),

          status:
            "not-started",
        },

        {
          id:
            "applied-project",

          order: 3,

          title:
            `Apply ${targetRole} skills in a portfolio project`,

          description:
            `Create a project that demonstrates practical ${targetRole} ability and produces evidence that can be referenced in your portfolio and résumé.`,

          estimatedHours:
            projectHours,

          skills:
            roleSkills.slice(
              2
            ),

          status:
            "not-started",
        },

        {
          id:
            "career-readiness",

          order: 4,

          title:
            `Prepare for ${targetRole} opportunities`,

          description:
            `Review your completed work, identify remaining gaps, update your career materials, and prepare to compare your skills with relevant ${targetRole} opportunities.`,

          estimatedHours:
            readinessHours,

          skills: [
            "Portfolio Review",
            "Résumé Alignment",
            "Interview Preparation",
          ],

          status:
            "not-started",
        },
      ],
    },
  };
}