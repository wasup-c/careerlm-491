import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import {
    mapQuestionnaireToPersistence,
  } from "./questionnaire-persistence-mapper";
  
  import type {
    QuestionnaireResponse,
    WeeklyTimeCommitment,
  } from "@/types/career";
  
  function createQuestionnaire(
    overrides:
      Partial<QuestionnaireResponse> = {}
  ): QuestionnaireResponse {
    return {
      targetCareerRole:
        "Cybersecurity Analyst",
  
      experienceLevel:
        "Beginner (little to no experience)",
  
      weeklyTimeCommitment:
        "5-10 hours",
  
      targetTimeline:
        "3-6 months",
  
      preferredLearningStyle: [
        "Hands-on projects",
      ],
  
      ...overrides,
    };
  }
  
  describe(
    "mapQuestionnaireToPersistence",
    () => {
      it(
        "maps validated onboarding data to the persistence contract",
        () => {
          const result =
            mapQuestionnaireToPersistence(
              createQuestionnaire()
            );
  
          expect(result).toEqual({
            targetRole:
              "Cybersecurity Analyst",
  
            experienceLevel:
              "beginner",
  
            existingSkills: [],
  
            learningStyle:
              "Hands-on projects",
  
            weeklyHours: 8,
  
            additionalResponses: {
              targetTimeline:
                "3-6 months",
  
              weeklyTimeCommitment:
                "5-10 hours",
  
              preferredLearningStyle: [
                "Hands-on projects",
              ],
  
              sourceExperienceLevel:
                "Beginner (little to no experience)",
            },
          });
        }
      );
  
      it.each([
        [
          "Beginner (little to no experience)",
          "beginner",
        ],
        [
          "Intermediate (some coursework/projects)",
          "intermediate",
        ],
        [
          "Advanced (professional or extensive project experience)",
          "advanced",
        ],
      ])(
        "maps experience level %s to %s",
        (
          sourceExperienceLevel,
          expectedExperienceLevel
        ) => {
          const result =
            mapQuestionnaireToPersistence(
              createQuestionnaire({
                experienceLevel:
                  sourceExperienceLevel,
              })
            );
  
          expect(
            result.experienceLevel
          ).toBe(
            expectedExperienceLevel
          );
        }
      );
  
      it.each<
        [
          WeeklyTimeCommitment,
          number,
        ]
      >([
        [
          "Less than 5 hours",
          4,
        ],
        [
          "5-10 hours",
          8,
        ],
        [
          "10-20 hours",
          15,
        ],
        [
          "More than 20 hours",
          21,
        ],
      ])(
        "maps weekly commitment %s to representative weekly hours %s",
        (
          weeklyTimeCommitment,
          expectedHours
        ) => {
          const result =
            mapQuestionnaireToPersistence(
              createQuestionnaire({
                weeklyTimeCommitment,
              })
            );
  
          expect(
            result.weeklyHours
          ).toBe(
            expectedHours
          );
        }
      );
  
      it(
        "preserves all selected learning preferences",
        () => {
          const learningStyles = [
            "Hands-on projects",
            "Mentorship and guidance",
            "Community support",
          ];
  
          const result =
            mapQuestionnaireToPersistence(
              createQuestionnaire({
                preferredLearningStyle:
                  learningStyles,
              })
            );
  
          expect(
            result.learningStyle
          ).toBe(
            "Hands-on projects, Mentorship and guidance, Community support"
          );
  
          expect(
            result.additionalResponses
              ?.preferredLearningStyle
          ).toEqual(
            learningStyles
          );
        }
      );
  
      it(
        "does not reuse the questionnaire learning-style array",
        () => {
          const questionnaire =
            createQuestionnaire({
              preferredLearningStyle: [
                "Hands-on projects",
                "Community support",
              ],
            });
  
          const result =
            mapQuestionnaireToPersistence(
              questionnaire
            );
  
          const storedStyles =
            result.additionalResponses
              ?.preferredLearningStyle;
  
          expect(
            storedStyles
          ).toEqual(
            questionnaire
              .preferredLearningStyle
          );
  
          expect(
            storedStyles
          ).not.toBe(
            questionnaire
              .preferredLearningStyle
          );
        }
      );
    }
  );