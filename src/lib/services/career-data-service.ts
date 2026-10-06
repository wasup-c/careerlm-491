import type {
    CurrentUserProvider,
  } from "../auth/current-user-provider";
  
  import {
    requireCurrentUser,
  } from "../auth/require-current-user";
  
  import type {
    MilestoneStatus,
    QuestionnaireInput,
    QuestionnaireRecord,
    RoadmapInput,
    RoadmapRecord,
  } from "../persistence/domain";
  
  import type {
    CareerRepository,
  } from "../persistence/repository";
  
  /**
   * Application-service boundary for user-owned CareerLM data.
   *
   * Higher-level application code should depend on this service rather than
   * choosing persistence user IDs directly.
   *
   * CareerDataService resolves the active CareerLM user through
   * CurrentUserProvider and scopes every repository operation to that user.
   *
   * This keeps authentication/session concerns separate from persistence
   * technology while preventing callers from selecting arbitrary user IDs.
   */
  export class CareerDataService {
    constructor(
      private readonly repository:
        CareerRepository,
  
      private readonly currentUserProvider:
        CurrentUserProvider
    ) {}
  
    /**
     * Returns the questionnaire owned by the current user.
     *
     * Returns null when the authenticated user has not saved a questionnaire.
     * Throws AuthenticationRequiredError when there is no valid current user.
     */
    async getMyQuestionnaire():
      Promise<QuestionnaireRecord | null>
    {
      const userId =
        await this.requireCurrentUserId();
  
      return this.repository
        .getQuestionnaire(userId);
    }
  
    /**
     * Saves or replaces the questionnaire owned by the current user.
     *
     * Validation and persistence behavior remain the responsibility of the
     * CareerRepository implementation.
     */
    async saveMyQuestionnaire(
      input: QuestionnaireInput
    ): Promise<QuestionnaireRecord> {
      const userId =
        await this.requireCurrentUserId();
  
      return this.repository
        .saveQuestionnaire(
          userId,
          input
        );
    }
  
    /**
     * Returns the active roadmap owned by the current user.
     *
     * Returns null when the authenticated user does not currently have
     * an active roadmap.
     */
    async getMyRoadmap():
      Promise<RoadmapRecord | null>
    {
      const userId =
        await this.requireCurrentUserId();
  
      return this.repository
        .getActiveRoadmap(userId);
    }
  
    /**
     * Creates or replaces the active roadmap owned by the current user.
     */
    async createOrReplaceMyRoadmap(
      input: RoadmapInput
    ): Promise<RoadmapRecord> {
      const userId =
        await this.requireCurrentUserId();
  
      return this.repository
        .createOrReplaceRoadmap(
          userId,
          input
        );
    }
  
    /**
     * Updates one milestone on the current user's active roadmap.
     *
     * This service is responsible for user scoping only.
     * Progress-percentage calculations, prerequisite rules, and other roadmap
     * business logic remain outside this service.
     */
    async updateMyMilestoneStatus(
      milestoneId: string,
      status: MilestoneStatus
    ): Promise<RoadmapRecord> {
      const userId =
        await this.requireCurrentUserId();
  
      return this.repository
        .updateMilestoneStatus(
          userId,
          milestoneId,
          status
        );
    }
  
    /**
     * Removes the persistence state owned by the current user.
     *
     * The repository currently calls this operation resetDemoData, but the
     * application-service API intentionally exposes a user-oriented name so
     * callers do not depend on persistence/demo naming.
     */
    async resetMyData():
      Promise<void>
    {
      const userId =
        await this.requireCurrentUserId();
  
      await this.repository
        .resetDemoData(userId);
    }
  
    /**
     * Centralizes the session-to-persistence identity boundary.
     *
     * Every public operation resolves the current user at operation time.
     * The service does not cache the user identity, which allows a real
     * session provider to reflect session changes between requests.
     */
    private async requireCurrentUserId():
      Promise<string>
    {
      const currentUser =
        await requireCurrentUser(
          this.currentUserProvider
        );
  
      return currentUser.id;
    }
  }