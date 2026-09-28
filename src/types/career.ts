// QuestionnaireResponse
// CareerRoadmap
// RoadmapMilestone
// GenerateRoadmapResponse
// or equivalent shared T1 files

export type WeeklyTimeCommitment =
  | "Less than 5 hours"
  | "5-10 hours"
  | "10-20 hours"
  | "More than 20 hours";

export interface QuestionnaireResponse {
  targetCareerRole: string;
  experienceLevel: string;
  targetTimeline: string;
  preferredLearningStyle: string;
  weeklyTimeCommitment: WeeklyTimeCommitment;
}

export interface CareerRoadmap {
  id: string;
  targetRole: string;
  progressPercentage?: number;
  milestones: RoadmapMilestone[];
}

export type MilestoneStatus =
  | "not-started"
  | "in-progress"
  | "completed";

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  skills: string[];
  estimatedTime: string;
  status: MilestoneStatus;
  additionalInfo?: string;
}

export type GenerateRoadmapErrorCode =
  | "VALIDATION_ERROR"
  | "GENERATION_FAILED"
  | "PERSISTENCE_FAILED"
  | "INTERNAL_ERROR";

export type GenerateRoadmapResponse =
  | {
      success: true;
      roadmap: CareerRoadmap;
    }
  | {
      success: false;
      error: {
        code: GenerateRoadmapErrorCode;
        message: string;
        fieldErrors?: Record<string, string>;
      };
    };