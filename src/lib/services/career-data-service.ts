import type {
  CurrentUserProvider,
} from "../auth/current-user-provider";

import {
  requireCurrentUser,
} from "../auth/require-current-user";

import type {
  JobOpportunity,
} from "../jobs/domain";

import type {
  JobProvider,
} from "../jobs/provider";

import {
  JobProviderUnavailableError,
} from "../jobs/provider-errors";

import type {
  JobPreferencesInput,
  JobPreferencesRecord,
  MilestoneStatus,
  ProfileInput,
  ProfileRecord,
  QuestionnaireInput,
  QuestionnaireRecord,
  ResumeInput,
  ResumeRecord,
  RoadmapInput,
  RoadmapRecord,
} from "../persistence/domain";

import type {
  CareerRepository,
} from "../persistence/repository";

import {
  buildJobSearchContext,
  buildJobSearchQueryFromContext,
} from "./job-search-context";

import type {
  JobSearchContext,
  JobSearchOptions,
} from "./job-search-context";

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
      CurrentUserProvider,

    private readonly jobProvider?:
      JobProvider
  ) {}

  /**
   * Returns the profile owned by the current user.
   *
   * Returns null when the authenticated user has not saved a profile.
   * Throws AuthenticationRequiredError when there is no valid current user.
   */
  async getMyProfile():
    Promise<ProfileRecord | null>
  {
    const userId =
      await this.requireCurrentUserId();

    return this.repository
      .getProfile(
        userId
      );
  }

  /**
   * Saves the current user's profile.
   *
   * The caller does not supply a user ID. Ownership is resolved from the
   * current-user provider on every operation.
   */
  async saveMyProfile(
    input: ProfileInput
  ): Promise<ProfileRecord> {
    const userId =
      await this.requireCurrentUserId();

    return this.repository
      .saveProfile(
        userId,
        input
      );
  }

  /**
   * Returns the normalized résumé owned by the current user.
   *
   * Returns null when the authenticated user has not saved a résumé.
   * Throws AuthenticationRequiredError when there is no valid current user.
   */
  async getMyResume():
    Promise<ResumeRecord | null>
  {
    const userId =
      await this.requireCurrentUserId();

    return this.repository
      .getResume(
        userId
      );
  }

  /**
   * Saves or replaces the current user's normalized résumé.
   *
   * The caller supplies résumé content only. Ownership is resolved from the
   * current-user provider so application/API code cannot select an arbitrary
   * persistence user ID.
   */
  async saveMyResume(
    input: ResumeInput
  ): Promise<ResumeRecord> {
    const userId =
      await this.requireCurrentUserId();

    return this.repository
      .saveResume(
        userId,
        input
      );
  }

  /**
   * Deletes only the current user's persisted résumé.
   *
   * Other user-owned CareerLM data such as profile, questionnaire, roadmap,
   * and job preferences remain intact.
   */
  async deleteMyResume():
    Promise<void>
  {
    const userId =
      await this.requireCurrentUserId();

    await this.repository
      .deleteResume(
        userId
      );
  }

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
      .getQuestionnaire(
        userId
      );
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
   * Returns null when the authenticated user does not currently have an
   * active roadmap.
   */
  async getMyRoadmap():
    Promise<RoadmapRecord | null>
  {
    const userId =
      await this.requireCurrentUserId();

    return this.repository
      .getActiveRoadmap(
        userId
      );
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
   * Returns the job-search preferences owned by the current user.
   *
   * The caller cannot select an arbitrary persistence user ID.
   */
  async getMyJobPreferences():
    Promise<JobPreferencesRecord | null>
  {
    const userId =
      await this.requireCurrentUserId();

    return this.repository
      .getJobPreferences(
        userId
      );
  }

  /**
   * Saves or replaces the current user's job-search preferences.
   */
  async saveMyJobPreferences(
    input:
      JobPreferencesInput
  ): Promise<JobPreferencesRecord> {
    const userId =
      await this.requireCurrentUserId();

    return this.repository
      .saveJobPreferences(
        userId,
        input
      );
  }

  /**
   * Aggregates the current user's available CareerLM information into one
   * provider-independent job-search/matching context.
   *
   * The identity is resolved once for the entire aggregation so all source
   * records belong to the same user even if a session provider could change
   * between separate application operations.
   */
  async getMyJobSearchContext():
    Promise<JobSearchContext>
  {
    const userId =
      await this.requireCurrentUserId();

    const [
      jobPreferences,
      profile,
      questionnaire,
      resume,
      roadmap,
    ] =
      await Promise.all([
        this.repository
          .getJobPreferences(
            userId
          ),

        this.repository
          .getProfile(
            userId
          ),

        this.repository
          .getQuestionnaire(
            userId
          ),

        this.repository
          .getResume(
            userId
          ),

        this.repository
          .getActiveRoadmap(
            userId
          ),
      ]);

    return buildJobSearchContext({
      jobPreferences,
      profile,
      questionnaire,
      resume,
      roadmap,
    });
  }

  /**
   * Searches external job opportunities using only current-user CareerLM
   * context.
   *
   * Callers cannot supply an arbitrary user ID or directly choose persisted
   * career data. The context is resolved through the same current-user
   * boundary used by the rest of CareerLM.
   */
  async searchJobsForMe(
    options:
      JobSearchOptions = {}
  ): Promise<JobOpportunity[]> {
    const context =
      await this
        .getMyJobSearchContext();

    const query =
      buildJobSearchQueryFromContext(
        context,
        options
      );

    if (!this.jobProvider) {
      throw new JobProviderUnavailableError();
    }

    return this.jobProvider
      .searchJobs(
        query
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
      .resetDemoData(
        userId
      );
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