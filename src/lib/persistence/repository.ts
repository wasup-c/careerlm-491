import type {
    MilestoneStatus,
    QuestionnaireInput,
    QuestionnaireRecord,
    RoadmapInput,
    RoadmapRecord,
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
  
    resetDemoData(userId: string): Promise<void>;
  }