export type MilestoneStatus =
  | "not-started"
  | "in-progress"
  | "completed";

/**
 * Shared representation of the answers collected by the
 * CareerLM onboarding questionnaire.
 *
 * Sprint 1 establishes the contract only.
 * The onboarding UI can populate this structure later.
 */
export interface QuestionnaireResponses {
  targetRole: string;
  experienceLevel: string;
  existingSkills: string[];
  learningStyle: string;
  weeklyHours: number;
}

/**
 * Alias matching the terminology used in the project specification.
 */
export type QuestionnaireInput = QuestionnaireResponses;

/**
 * A single ordered step in a CareerLM roadmap.
 */
export interface RoadmapMilestone {
  id: string;
  order: number;
  title: string;
  description: string;
  estimatedHours: number;
  skills: string[];
  status: MilestoneStatus;
  additionalInfo?: string;
}

/**
 * Shared representation of a generated CareerLM roadmap.
 */
export interface CareerRoadmap {
  id: string;
  title: string;
  targetRole: string;
  estimatedWeeks: number;
  milestones: RoadmapMilestone[];
}
