import type { CareerRoadmap } from "@/types/career";

export const mockRoadmap: CareerRoadmap = {
  id: "roadmap-1",
  targetRole: "Full-Stack Developer",
  progressPercentage: 33,

  milestones: [
    {
      id: "milestone-1",
      title: "Strengthen JavaScript Fundamentals",
      description:
        "Develop stronger knowledge of JavaScript concepts required for modern web development.",
      skills: [
        "JavaScript",
        "ES6",
        "Arrays and Objects",
        "Functions",
        "Asynchronous Programming",
        "Problem Solving",
      ],
      estimatedTime: "2-3 weeks",
      status: "completed",
      additionalInfo:
        "Focus on writing clean JavaScript and solving small programming problems.",
    },

    {
      id: "milestone-2",
      title: "Learn React and Next.js",
      description:
        "Progress into component-based frontend development using React and Next.js.",
      skills: [
        "React",
        "Next.js",
        "TypeScript",
        "Component Architecture",
        "State Management",
      ],
      estimatedTime: "4-6 weeks",
      status: "in-progress",
      additionalInfo:
        "Build small React components before combining them into larger applications.",
    },

    {
      id: "milestone-3",
      title: "Build a Full-Stack Portfolio Project",
      description:
        "Combine previous knowledge into a complete application that can be demonstrated to employers.",
      skills: [
        "React",
        "Next.js",
        "TypeScript",
        "API Integration",
        "Database Concepts",
        "Git",
        "GitHub",
      ],
      estimatedTime: "6-8 weeks",
      status: "not-started",
      additionalInfo:
        "Create a portfolio project that demonstrates both frontend and backend development skills.",
    },
  ],
};
