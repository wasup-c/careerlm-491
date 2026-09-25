import type { Roadmap } from "@/types/career";

export const mockRoadmap: Roadmap = {
  id: "software-engineer-roadmap",
  title: "Software Engineer Career Roadmap",
  targetRole: "Software Engineer",
  estimatedWeeks: 16,
  milestones: [
    {
      id: "programming-foundations",
      order: 1,
      title: "Build Programming Foundations",
      description:
        "Strengthen core programming concepts, problem solving, and version-control habits before moving into larger projects.",
      estimatedHours: 30,
      skills: [
        "TypeScript",
        "Problem Solving",
        "Git",
        "GitHub",
      ],
      status: "completed",
    },
    {
      id: "web-development",
      order: 2,
      title: "Develop Modern Web Skills",
      description:
        "Practice building typed, component-based web interfaces and connecting application behavior to reusable data models.",
      estimatedHours: 45,
      skills: [
        "React",
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
      ],
      status: "in-progress",
    },
    {
      id: "portfolio-project",
      order: 3,
      title: "Complete a Portfolio Project",
      description:
        "Build and document a complete project that demonstrates planning, implementation, testing, and collaboration skills.",
      estimatedHours: 50,
      skills: [
        "Project Planning",
        "Testing",
        "Documentation",
        "Teamwork",
      ],
      status: "not-started",
    },
  ],
};
