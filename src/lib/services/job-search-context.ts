import type {
    JobEmploymentType,
    JobExperienceLevel,
    JobSearchQuery,
    JobWorkplaceType,
  } from "../jobs/domain";
  
  import {
    normalizeJobSearchQuery,
  } from "../jobs/validation";
  
  import type {
    ExperienceLevel,
    JobPreferencesRecord,
    ProfileRecord,
    QuestionnaireRecord,
    ResumeRecord,
    RoadmapRecord,
  } from "../persistence/domain";
  
  import {
    JobSearchContextRequiredError,
  } from "./job-search-errors";
  
  /**
   * Identifies which persisted CareerLM sources are currently available.
   *
   * Availability is kept separate from whether résumé/portfolio information is
   * actually permitted for matching by the current job preferences.
   */
  export interface JobSearchContextSources {
    preferences: boolean;
  
    profile: boolean;
  
    questionnaire: boolean;
  
    resume: boolean;
  
    portfolio: boolean;
  }
  
  /**
   * Provider-independent application representation of the current user's
   * available job-matching information.
   *
   * This object intentionally contains no provider-specific fields.
   */
  export interface JobSearchContext {
    targetRole?: string;
  
    /**
     * Search keywords selected using this precedence:
     *
     * 1. saved job preference keywords
     * 2. profile/questionnaire target role
     * 3. available skill evidence
     */
    keywords?: string;
  
    location?: string;
  
    workplaceTypes: JobWorkplaceType[];
  
    employmentTypes: JobEmploymentType[];
  
    experienceLevels: JobExperienceLevel[];
  
    careerExperienceLevel?: ExperienceLevel;
  
    questionnaireSkills: string[];
  
    resumeSkills: string[];
  
    resumeExperience: string[];
  
    portfolioSkills: string[];
  
    completedMilestoneIds: string[];
  
    useResumeForMatching: boolean;
  
    usePortfolioForMatching: boolean;
  
    sources: JobSearchContextSources;
  }
  
  /**
   * Inputs already scoped to one CareerLM user by CareerDataService.
   */
  export interface BuildJobSearchContextInput {
    jobPreferences:
      JobPreferencesRecord | null;
  
    profile:
      ProfileRecord | null;
  
    questionnaire:
      QuestionnaireRecord | null;
  
    resume:
      ResumeRecord | null;
  
    roadmap:
      RoadmapRecord | null;
  }
  
  /**
   * Optional controls for a current-user search.
   *
   * Search identity and career context are intentionally not accepted here.
   */
  export interface JobSearchOptions {
    limit?: number;
  }
  
  function normalizeOptionalText(
    value: string | undefined
  ): string | undefined {
    if (
      value === undefined
    ) {
      return undefined;
    }
  
    const normalized =
      value.trim();
  
    return (
      normalized ||
      undefined
    );
  }
  
  function uniqueStrings(
    values:
      readonly string[]
  ): string[] {
    const result:
      string[] = [];
  
    const seen =
      new Set<string>();
  
    for (
      const value of values
    ) {
      const normalized =
        value.trim();
  
      if (!normalized) {
        continue;
      }
  
      const key =
        normalized.toLowerCase();
  
      if (
        seen.has(key)
      ) {
        continue;
      }
  
      seen.add(key);
  
      result.push(
        normalized
      );
    }
  
    return result;
  }
  
  function mapCareerExperienceLevel(
    value:
      ExperienceLevel | undefined
  ): JobExperienceLevel | undefined {
    switch (value) {
      case "beginner":
        return "entry";
  
      case "intermediate":
        return "mid";
  
      case "advanced":
        return "senior";
  
      default:
        return undefined;
    }
  }
  
  /**
   * Aggregates the current user's persisted CareerLM state into one stable
   * application-layer object that later matching/ranking logic can consume.
   *
   * Missing sources are valid. CareerLM does not require all profile,
   * questionnaire, résumé, portfolio, and preference data to exist.
   */
  export function buildJobSearchContext(
    input: BuildJobSearchContextInput
  ): JobSearchContext {
    const preferences =
      input.jobPreferences;
  
    const profileTargetRole =
      normalizeOptionalText(
        input.profile
          ?.targetRole
      );
  
    const questionnaireTargetRole =
      normalizeOptionalText(
        input.questionnaire
          ?.targetRole
      );
  
    const targetRole =
      profileTargetRole ??
      questionnaireTargetRole;
  
    const careerExperienceLevel =
      input.profile
        ?.experienceLevel ??
      input.questionnaire
        ?.experienceLevel;
  
    /*
     * If the user has not yet saved job preferences, résumé and portfolio
     * evidence remain available so CareerLM can support the alternate flows
     * defined by the project requirements.
     *
     * Once preferences exist, their explicit matching-source switches are
     * respected.
     */
    const useResumeForMatching =
      preferences
        ?.useResumeForMatching ??
      true;
  
    const usePortfolioForMatching =
      preferences
        ?.usePortfolioForMatching ??
      true;
  
    const questionnaireSkills =
      uniqueStrings(
        input.questionnaire
          ?.existingSkills ??
        []
      );
  
    const resumeSkills =
      useResumeForMatching
        ? uniqueStrings(
            input.resume
              ?.sections
              .skills ??
            []
          )
        : [];
  
    const resumeExperience =
      useResumeForMatching
        ? uniqueStrings(
            input.resume
              ?.sections
              .experience ??
            []
          )
        : [];
  
    const completedMilestones =
      input.roadmap
        ?.milestones
        .filter(
          (milestone) =>
            milestone.status ===
            "completed"
        ) ??
      [];
  
    const portfolioSkills =
      usePortfolioForMatching
        ? uniqueStrings(
            completedMilestones
              .flatMap(
                (milestone) =>
                  milestone.skills
              )
          )
        : [];
  
    const completedMilestoneIds =
      usePortfolioForMatching
        ? completedMilestones
            .map(
              (milestone) =>
                milestone.id
            )
        : [];
  
    const explicitExperienceLevels =
      preferences
        ?.experienceLevels ??
      [];
  
    const mappedExperienceLevel =
      mapCareerExperienceLevel(
        careerExperienceLevel
      );
  
    const experienceLevels:
      JobExperienceLevel[] =
      preferences
        ? [
            ...explicitExperienceLevels,
          ]
        : mappedExperienceLevel
          ? [
              mappedExperienceLevel,
            ]
          : [];
  
    const fallbackSkillKeywords =
      uniqueStrings([
        ...questionnaireSkills,
  
        ...resumeSkills,
  
        ...portfolioSkills,
      ]);
  
    const skillKeywordSearch =
      fallbackSkillKeywords
        .slice(0, 5)
        .join(" ");
  
    const keywords =
      normalizeOptionalText(
        preferences
          ?.keywords
      ) ??
      targetRole ??
      (
        skillKeywordSearch ||
        undefined
      );
  
    const context:
      JobSearchContext = {
        workplaceTypes:
          preferences
            ? [
                ...preferences
                  .workplaceTypes,
              ]
            : [],
  
        employmentTypes:
          preferences
            ? [
                ...preferences
                  .employmentTypes,
              ]
            : [],
  
        experienceLevels,
  
        questionnaireSkills,
  
        resumeSkills,
  
        resumeExperience,
  
        portfolioSkills,
  
        completedMilestoneIds,
  
        useResumeForMatching,
  
        usePortfolioForMatching,
  
        sources: {
          preferences:
            preferences !==
            null,
  
          profile:
            input.profile !==
            null,
  
          questionnaire:
            input.questionnaire !==
            null,
  
          resume:
            input.resume !==
            null,
  
          portfolio:
            completedMilestones
              .length > 0,
        },
      };
  
    if (
      targetRole !==
      undefined
    ) {
      context.targetRole =
        targetRole;
    }
  
    if (
      keywords !==
      undefined
    ) {
      context.keywords =
        keywords;
    }
  
    if (
      preferences
        ?.location !==
      undefined
    ) {
      context.location =
        preferences.location;
    }
  
    if (
      careerExperienceLevel !==
      undefined
    ) {
      context.careerExperienceLevel =
        careerExperienceLevel;
    }
  
    return context;
  }
  
  /**
   * Converts the provider-independent current-user search context into the
   * normalized query supplied to JobProvider.
   */
  export function buildJobSearchQueryFromContext(
    context:
      JobSearchContext,
    options:
      JobSearchOptions = {}
  ): JobSearchQuery {
    if (
      !context.keywords
    ) {
      throw new JobSearchContextRequiredError();
    }
  
    return normalizeJobSearchQuery({
      keywords:
        context.keywords,
  
      location:
        context.location,
  
      workplaceTypes:
        context.workplaceTypes,
  
      employmentTypes:
        context.employmentTypes,
  
      experienceLevels:
        context.experienceLevels,
  
      limit:
        options.limit,
    });
  }