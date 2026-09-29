import type { CareerRoadmap } from "@/types/career";

export const mockRoadmap: CareerRoadmap = {
  title: "Frontend Developer Career Roadmap",
  targetRole: "Frontend Developer",

  // Replace with the team-approved positive integer.
  estimatedWeeks: 1,

  milestones: [
    {
      id: "milestone-html-css",
      order: 1,
      title: "Strengthen HTML and CSS fundamentals",
      description:
        "Build a strong foundation in semantic HTML, responsive layouts, accessibility, and modern CSS.",

      // Replace with the team-approved estimate.
      estimatedHours: 0,

      skills: [
        "HTML",
        "CSS",
        "Responsive Design",
        "Accessibility",
      ],
      status: "completed",
    },
    {
      id: "milestone-typescript",
      order: 2,
      title: "Build confidence with JavaScript and TypeScript",
      description:
        "Practice core JavaScript concepts and use TypeScript to model application data safely.",

      // Replace with the team-approved estimate.
      estimatedHours: 0,

      skills: [
        "JavaScript",
        "TypeScript",
        "ES6+",
        "Debugging",
      ],
      status: "in-progress",
    },
    {
      id: "milestone-react-next",
      order: 3,
      title: "Create projects with React and Next.js",
      description:
        "Apply your frontend fundamentals by building reusable components and routed application pages.",

      // Replace with the team-approved estimate.
      estimatedHours: 0,

      skills: [
        "React",
        "Next.js",
        "Component Design",
        "Routing",
      ],
      status: "not-started",
    },
  ],
};
