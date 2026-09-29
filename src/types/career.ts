import type {
  MilestoneInput,
  MilestoneStatus as PersistenceMilestoneStatus,
  RoadmapInput,
} from "@/lib/persistence/domain";

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
  preferredLearningStyle: string[];
  weeklyTimeCommitment: WeeklyTimeCommitment;
}

export type MilestoneStatus = PersistenceMilestoneStatus;

export type RoadmapMilestone = MilestoneInput;

export type CareerRoadmap = RoadmapInput;

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
