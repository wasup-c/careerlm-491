import type {
  JobEmploymentType,
  JobExperienceLevel,
  JobWorkplaceType,
} from "../jobs/domain";

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

/**
 * Persistence-layer representation of a user's editable CareerLM profile.
 *
 * Fields are optional so CareerLM can safely persist partial profiles while
 * the higher-level application profile contract continues to evolve.
 *
 * This type intentionally does not depend on dashboard/UI models.
 */
export interface ProfileInput {
  name?: string;

  targetRole?: string;

  experienceLevel?: ExperienceLevel;
}

export interface ProfileRecord
  extends ProfileInput {
  userId: string;

  /**
   * Allows future migrations if the persisted profile structure changes.
   */
  schemaVersion: 1;

  createdAt: string;

  updatedAt: string;
}

/**
 * Normalized résumé sections produced by the résumé parsing layer.
 *
 * Empty arrays represent sections that were not present in the submitted
 * résumé. This gives downstream persistence and analysis code a stable
 * structure without requiring parser-specific optional properties.
 */
export interface ResumeSections {
  education: string[];

  experience: string[];

  skills: string[];

  projects: string[];
}

/**
 * Storage-independent résumé information accepted by the persistence layer.
 *
 * The persistence domain stores normalized textual information rather than
 * raw PDF/DOCX binary data. File parsing and text extraction belong to the
 * résumé-processing layer outside of persistence.
 */
export interface ResumeInput {
  normalizedText: string;

  sections: ResumeSections;
}

/**
 * Persisted current résumé for one CareerLM user.
 *
 * CareerLM currently models one active/current résumé per user. A future
 * version-history feature can be added without exposing storage technology
 * to application consumers.
 */
export interface ResumeRecord
  extends ResumeInput {
  userId: string;

  /**
   * Allows future migrations if the persisted résumé structure changes.
   */
  schemaVersion: 1;

  createdAt: string;

  updatedAt: string;
}

/**
 * User-owned job-search and matching preferences.
 *
 * These values describe what the CareerLM user wants independently of the
 * currently configured external job provider.
 */
export interface JobPreferencesInput {
  keywords: string;

  location?: string;

  workplaceTypes: JobWorkplaceType[];

  employmentTypes: JobEmploymentType[];

  experienceLevels: JobExperienceLevel[];

  useResumeForMatching: boolean;

  usePortfolioForMatching: boolean;
}

/**
 * Persisted current job-search preferences for one CareerLM user.
 */
export interface JobPreferencesRecord
  extends JobPreferencesInput {
  userId: string;

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
 * Later sprints can continue extending this with additional
 * user-owned state, such as explicitly saved portfolio artifacts,
 * without changing repository consumers unnecessarily.
 */
export interface UserPersistenceState {
  profile?: ProfileRecord;

  questionnaire?: QuestionnaireRecord;

  activeRoadmap?: RoadmapRecord;

  resume?: ResumeRecord;

  jobPreferences?: JobPreferencesRecord;
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