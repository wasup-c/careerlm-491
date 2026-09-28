import type { CareerRoadmap } from "@/types/career";

export const mockRoadmap: CareerRoadmap = {
  id: "roadmap-frontend-developer",
  targetRole: "Frontend Developer",
  progressPercentage: 33,
  milestones: [
    {
      id: "milestone-html-css",
      title: "Strengthen HTML and CSS fundamentals",
      description:
        "Build a strong foundation in semantic HTML, responsive layouts, accessibility, and modern CSS.",
      skills: [
        "HTML",
        "CSS",
        "Responsive Design",
        "Accessibility",
      ],
      estimatedTime: "2-3 weeks",
      status: "completed",
      additionalInfo:
        "Create one responsive page that works well on mobile and desktop before moving on.",
    },
    {
      id: "milestone-typescript",
      title: "Build confidence with JavaScript and TypeScript",
      description:
        "Practice core JavaScript concepts and use TypeScript to model application data safely.",
      skills: [
        "JavaScript",
        "TypeScript",
        "ES6+",
        "Debugging",
      ],
      estimatedTime: "3-4 weeks",
      status: "in-progress",
      additionalInfo:
        "Focus on functions, arrays, objects, asynchronous code, interfaces, and union types.",
    },
    {
      id: "milestone-react-next",
      title: "Create projects with React and Next.js",
      description:
        "Apply your frontend fundamentals by building reusable components and routed application pages.",
      skills: [
        "React",
        "Next.js",
        "Component Design",
        "Routing",
      ],
      estimatedTime: "4-6 weeks",
      status: "not-started",
      additionalInfo:
        "Use a portfolio project to demonstrate reusable components, state, routing, and responsive design.",
    },
  ],
};
