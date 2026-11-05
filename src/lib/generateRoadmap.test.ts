import {
  describe,
  expect,
  it,
} from "vitest";

import {
  generateRoadmap,
} from "@/lib/generateRoadmap";

import type {
  RoadmapInput,
} from "@/lib/persistence";

import type {
  QuestionnaireResponse,
} from "@/types/career";

function createQuestionnaire(
  overrides:
    Partial<QuestionnaireResponse> =
      {}
): QuestionnaireResponse {
  return {
    targetCareerRole:
      "Frontend Developer",

    experienceLevel:
      "Beginner (little to no experience)",

    targetTimeline:
      "3-6 months",

    preferredLearningStyle: [
      "Hands-on projects",
    ],

    weeklyTimeCommitment:
      "5-10 hours",

    ...overrides,
  };
}

describe(
  "generateRoadmap",
  () => {
    it(
      "generates a persistence-compatible roadmap",
      () => {
        const result =
          generateRoadmap(
            createQuestionnaire()
          );

        expect(
          result.success
        ).toBe(true);

        if (
          !result.success
        ) {
          throw new Error(
            "Expected generation to succeed."
          );
        }

        const roadmap:
          RoadmapInput =
            result.roadmap;

        expect(
          roadmap.targetRole
        ).toBe(
          "Frontend Developer"
        );

        expect(
          roadmap.estimatedWeeks
        ).toBeGreaterThan(
          0
        );

        expect(
          roadmap.milestones
            .length
        ).toBe(4);
      }
    );

    it(
      "trims the target career role",
      () => {
        const result =
          generateRoadmap(
            createQuestionnaire(
              {
                targetCareerRole:
                  "  Security Analyst  ",
              }
            )
          );

        expect(
          result.success
        ).toBe(true);

        if (
          !result.success
        ) {
          throw new Error(
            "Expected generation to succeed."
          );
        }

        expect(
          result.roadmap
            .targetRole
        ).toBe(
          "Security Analyst"
        );
      }
    );

    it(
      "changes skill emphasis based on target role",
      () => {
        const security =
          generateRoadmap(
            createQuestionnaire(
              {
                targetCareerRole:
                  "Security Analyst",
              }
            )
          );

        const data =
          generateRoadmap(
            createQuestionnaire(
              {
                targetCareerRole:
                  "Data Analyst",
              }
            )
          );

        if (
          !security.success ||
          !data.success
        ) {
          throw new Error(
            "Expected generation to succeed."
          );
        }

        const securitySkills =
          security.roadmap
            .milestones
            .flatMap(
              (
                milestone
              ) =>
                milestone.skills
            );

        const dataSkills =
          data.roadmap
            .milestones
            .flatMap(
              (
                milestone
              ) =>
                milestone.skills
            );

        expect(
          securitySkills
        ).toContain(
          "Networking"
        );

        expect(
          dataSkills
        ).toContain(
          "SQL"
        );
      }
    );

    it(
      "changes timeline based on questionnaire commitment",
      () => {
        const short =
          generateRoadmap(
            createQuestionnaire(
              {
                targetTimeline:
                  "Less than 3 months",
              }
            )
          );

        const long =
          generateRoadmap(
            createQuestionnaire(
              {
                targetTimeline:
                  "More than a year",
              }
            )
          );

        if (
          !short.success ||
          !long.success
        ) {
          throw new Error(
            "Expected generation to succeed."
          );
        }

        expect(
          short.roadmap
            .estimatedWeeks
        ).toBeLessThan(
          long.roadmap
            .estimatedWeeks
        );
      }
    );

    it(
      "changes the first milestone based on experience",
      () => {
        const beginner =
          generateRoadmap(
            createQuestionnaire()
          );

        const advanced =
          generateRoadmap(
            createQuestionnaire(
              {
                experienceLevel:
                  "Advanced (professional or extensive project experience)",
              }
            )
          );

        if (
          !beginner.success ||
          !advanced.success
        ) {
          throw new Error(
            "Expected generation to succeed."
          );
        }

        expect(
          beginner.roadmap
            .milestones[0]
            .title
        ).not.toBe(
          advanced.roadmap
            .milestones[0]
            .title
        );
      }
    );

    it(
      "does not store derived progress on the roadmap",
      () => {
        const result =
          generateRoadmap(
            createQuestionnaire()
          );

        expect(
          result.success
        ).toBe(true);

        if (
          !result.success
        ) {
          throw new Error(
            "Expected generation to succeed."
          );
        }

        expect(
          result.roadmap
        ).not.toHaveProperty(
          "progressPercentage"
        );
      }
    );

    it(
      "returns a validation error for an empty role",
      () => {
        const result =
          generateRoadmap(
            createQuestionnaire(
              {
                targetCareerRole:
                  "   ",
              }
            )
          );

        expect(
          result.success
        ).toBe(false);

        if (
          result.success
        ) {
          throw new Error(
            "Expected generation to fail."
          );
        }

        expect(
          result.error.code
        ).toBe(
          "VALIDATION_ERROR"
        );
      }
    );
  }
);