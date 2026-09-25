import type {
  CareerRoadmap,
  QuestionnaireResponses,
} from "@/types/career";

export const mockQuestionnaireResponses: QuestionnaireResponses = {
  targetRole: "Software Engineer",
  experienceLevel: "Beginner",
  existingSkills: [
    "HTML",
    "CSS",
    "JavaScript",
  ],
  learningStyle: "Project-based learning",
  weeklyHours: 10,
};

export const mockRoadmap: CareerRoadmap = {
  id: "roadmap-software-engineer-demo",
  title: "Software Engineer Career Roadmap",
  targetRole: "Software Engineer",
  estimatedWeeks: 12,

  milestones: [
    {
      id: "programming-foundations",
      order: 1,
      title: "Strengthen Programming Foundations",
      description:
        "Build a strong foundation in programming concepts needed for software engineering.",
      estimatedHours: 20,
      skills: [
        "JavaScript",
        "TypeScript",
        "Problem Solving",
      ],
      status: "completed",
      additionalInfo:
        "Focus on variables, functions, arrays, objects, control flow, and basic algorithms.",
    },

    {
      id: "frontend-development",
      order: 2,
      title: "Build Frontend Development Skills",
      description:
        "Practice building responsive and maintainable web interfaces using modern frontend tools.",
      estimatedHours: 30,
      skills: [
        "React",
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
      ],
      status: "in-progress",
      additionalInfo:
        "Create small projects that demonstrate reusable components and application routing.",
    },

    {
      id: "portfolio-project",
      order: 3,
      title: "Complete a Portfolio Project",
      description:
        "Create a complete software project that demonstrates your technical and problem-solving skills.",
      estimatedHours: 40,
      skills: [
        "Project Planning",
        "Git",
        "GitHub",
        "Testing",
        "Documentation",
      ],
      status: "not-started",
      additionalInfo:
        "Document the project and explain the technical decisions and skills demonstrated.",
    },
  ],
};
