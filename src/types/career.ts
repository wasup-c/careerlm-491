export type MilestoneStatus =
  | "not-started"
  | "in-progress"
  | "completed";

export type AnswerValue = string | string[];

export type OnboardingAnswers = Record<number, AnswerValue>;

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  skills: string[];
  estimatedTime: string;
  status: MilestoneStatus;
  additionalInfo?: string;
}

export interface CareerRoadmap {
  id: string;
  targetRole: string;
  progressPercentage: number;
  milestones: RoadmapMilestone[];
}
