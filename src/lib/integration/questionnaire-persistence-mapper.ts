import type {
    ExperienceLevel,
    QuestionnaireInput,
  } from "@/lib/persistence/domain";
  
  import type {
    QuestionnaireResponse,
    WeeklyTimeCommitment,
  } from "@/types/career";
  
  /**
   * The onboarding API currently stores weekly availability as a range,
   * while the persistence contract uses a numeric weekly-hours value.
   *
   * These representative values allow the current persistence model to
   * retain a useful numeric value while the original range is also
   * preserved in additionalResponses.
   */
  const WEEKLY_HOURS_BY_COMMITMENT:
    Record<WeeklyTimeCommitment, number> = {
      "Less than 5 hours": 4,
      "5-10 hours": 8,
      "10-20 hours": 15,
      "More than 20 hours": 21,
    };
  
  /**
   * Maps the validated onboarding experience label to the canonical
   * persistence-layer ExperienceLevel.
   *
   * validateQuestionnaire() is responsible for ensuring that only one
   * of these supported labels reaches this integration boundary.
   */
  function mapExperienceLevel(
    experienceLevel: string
  ): ExperienceLevel {
    switch (experienceLevel) {
      case "Beginner (little to no experience)":
        return "beginner";
  
      case "Intermediate (some coursework/projects)":
        return "intermediate";
  
      case "Advanced (professional or extensive project experience)":
        return "advanced";
  
      default:
        throw new Error(
          `Unsupported validated experience level: ${experienceLevel}`
        );
    }
  }
  
  /**
   * Adapts Member 3's validated onboarding questionnaire contract to
   * Member 1's canonical persistence contract.
   *
   * The original categorical questionnaire responses are retained in
   * additionalResponses so no information is discarded while the two
   * models continue to evolve independently.
   */
  export function mapQuestionnaireToPersistence(
    questionnaire: QuestionnaireResponse
  ): QuestionnaireInput {
    return {
      targetRole:
        questionnaire.targetCareerRole,
  
      experienceLevel:
        mapExperienceLevel(
          questionnaire.experienceLevel
        ),
  
      /**
       * The current onboarding questionnaire does not ask users to provide
       * an existing-skills list yet.
       */
      existingSkills: [],
  
      /**
       * Persistence currently exposes one learningStyle string, while the
       * onboarding questionnaire permits multiple selections.
       *
       * The full array is also preserved in additionalResponses.
       */
      learningStyle:
        questionnaire.preferredLearningStyle.join(
          ", "
        ),
  
      weeklyHours:
        WEEKLY_HOURS_BY_COMMITMENT[
          questionnaire.weeklyTimeCommitment
        ],
  
      additionalResponses: {
        targetTimeline:
          questionnaire.targetTimeline,
  
        weeklyTimeCommitment:
          questionnaire.weeklyTimeCommitment,
  
        preferredLearningStyle: [
          ...questionnaire.preferredLearningStyle,
        ],
  
        sourceExperienceLevel:
          questionnaire.experienceLevel,
      },
    };
  }