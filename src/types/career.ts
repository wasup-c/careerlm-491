export type MilestoneStatus =
  | "not-started"
  | "in-progress"
  | "completed";

export interface QuestionnaireInput {
  targetRole: string;
  experienceLevel: string;
  existingSkills: string[];
  learningStyle: string;
  weeklyHours: number;
}

export interface Milestone {
  id: string;
  order: number;
  title: string;
  description: string;
  estimatedHours: number;
  skills: string[];
  status: MilestoneStatus;
}

export interface Roadmap {
  id: string;
  title: string;
  targetRole: string;
  estimatedWeeks: number;
  milestones: Milestone[];
}
