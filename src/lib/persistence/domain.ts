export type ExperienceLevel =
  | "beginner"
  | "intermediate"
  | "advanced";

export type MilestoneStatus =
  | "not-started"
  | "in-progress"
  | "completed";

export type AdditionalResponse =
  | string
  | string[]
  | number
  | boolean
  | null;

/**
 * Canonical questionnaire information used by the persistence layer.
 *
 * additionalResponses allows CareerLM to preserve questionnaire fields
 * that have not yet been promoted into the shared domain model.
 *
 * This is especially useful while the onboarding questionnaire is still
 * evolving between sprints.
 */
export interface QuestionnaireInput {
  targetRole: string;

  experienceLevel: ExperienceLevel;

  existingSkills: string[];

  learningStyle: string;

  weeklyHours: number;

  additionalResponses?: Record<string, AdditionalResponse>;
}

export interface QuestionnaireRecord
  extends QuestionnaireInput {
  userId: string;

  /**
   * Allows future migrations if the questionnaire structure changes.
   */
  schemaVersion: 1;

  createdAt: string;

  updatedAt: string;
}

export interface MilestoneInput {
  /**
   * Optional so the persistence layer can generate an ID.
   *
   * Tests and seeded demo data may provide predictable IDs.
   */
  id?: string;

  order: number;

  title: string;

  description: string;

  estimatedHours: number;

  skills: string[];

  status: MilestoneStatus;
}

export interface MilestoneRecord
  extends Omit<MilestoneInput, "id"> {
  id: string;
}

export interface RoadmapInput {
  title: string;

  targetRole: string;

  estimatedWeeks: number;

  milestones: MilestoneInput[];
}

export interface RoadmapRecord
  extends Omit<RoadmapInput, "milestones"> {
  id: string;

  userId: string;

  milestones: MilestoneRecord[];

  createdAt: string;

  updatedAt: string;
}

/**
 * Everything CareerLM currently persists for one user.
 *
 * Later sprints can extend this with:
 * - profile
 * - resume metadata
 * - portfolio information
 * - job preferences
 *
 * without changing the repository consumer API unnecessarily.
 */
export interface UserPersistenceState {
  questionnaire?: QuestionnaireRecord;

  activeRoadmap?: RoadmapRecord;
}

/**
 * Root representation stored by the local adapter.
 *
 * schemaVersion exists so future versions can migrate older data
 * rather than silently breaking persisted development data.
 */
export interface PersistenceState {
  schemaVersion: 1;

  users: Record<string, UserPersistenceState>;
}

export function createEmptyPersistenceState(): PersistenceState {
  return {
    schemaVersion: 1,
    users: {},
  };
}