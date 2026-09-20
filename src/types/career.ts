export type MilestoneStatus =
  | "not-started"
  | "in-progress"
  | "completed";

export interface QuestionnaireResponse {
  targetCareerRole: string;
  experienceLevel: string;
  existingSkills: string[];
  preferredLearningStyle: string;
  weeklyTimeCommitment: number;
}

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
  progressPercentage?: number;
  milestones: RoadmapMilestone[];
}
