import type {
  MilestoneStatus,
  QuestionnaireInput,
  QuestionnaireRecord,
  RoadmapInput,
  RoadmapRecord,
  ProfileInput,
  ProfileRecord,
  ResumeInput,
  ResumeRecord,
} from "./domain";

/**
 * Storage-independent CareerLM persistence contract.
 *
 * Application code should depend on this interface rather than directly
 * depending on JSON, SQLite, PostgreSQL, Prisma, Supabase, etc.
 *
 * This allows the backing persistence technology to change in a later
 * sprint without requiring every feature to be rewritten.
 */
export interface CareerRepository {
  saveProfile(
    userId: string,
    input: ProfileInput
  ): Promise<ProfileRecord>;

  getProfile(
    userId: string
  ): Promise<ProfileRecord | null>;

  saveResume(
    userId: string,
    input: ResumeInput
  ): Promise<ResumeRecord>;

  getResume(
    userId: string
  ): Promise<ResumeRecord | null>;

  saveQuestionnaire(
    userId: string,
    input: QuestionnaireInput
  ): Promise<QuestionnaireRecord>;

  getQuestionnaire(
    userId: string
  ): Promise<QuestionnaireRecord | null>;

  createOrReplaceRoadmap(
    userId: string,
    input: RoadmapInput
  ): Promise<RoadmapRecord>;

  getActiveRoadmap(
    userId: string
  ): Promise<RoadmapRecord | null>;

  updateMilestoneStatus(
    userId: string,
    milestoneId: string,
    status: MilestoneStatus
  ): Promise<RoadmapRecord>;

  resetDemoData(
    userId: string
  ): Promise<void>;
}