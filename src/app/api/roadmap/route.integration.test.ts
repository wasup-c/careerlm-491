import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  QuestionnaireResponse,
} from "@/types/career";

/**
 * Keep this route integration test isolated from the application's
 * default .careerlm/data.json file.
 *
 * The route still exercises the real:
 *
 * - questionnaire validation
 * - questionnaire persistence mapper
 * - CareerDataService
 * - current-user provider
 * - roadmap generator
 *
 * but uses the in-memory repository adapter instead of the default
 * JSON-file repository.
 */
vi.mock(
  "@/lib/services/default-career-data-service",
  async () => {
    const {
      CareerDataService,
    } =
      await import(
        "@/lib/services/career-data-service"
      );

    const {
      InMemoryCareerRepository,
    } =
      await import(
        "@/lib/persistence/in-memory-repository"
      );

    const {
      DemoCurrentUserProvider,
    } =
      await import(
        "@/lib/auth/demo-current-user-provider"
      );

    return {
      careerDataService:
        new CareerDataService(
          new InMemoryCareerRepository(),
          new DemoCurrentUserProvider()
        ),
    };
  }
);

import {
  careerDataService,
} from "@/lib/services/default-career-data-service";

import {
  POST,
} from "./route";

const validQuestionnaire:
  QuestionnaireResponse = {
    targetCareerRole:
      "Software Engineer",

    experienceLevel:
      "Beginner (little to no experience)",

    weeklyTimeCommitment:
      "5-10 hours",

    targetTimeline:
      "3-6 months",

    preferredLearningStyle: [
      "Hands-on projects",
    ],
  };

function createRequest(
  body: unknown
): Request {
  return new Request(
    "http://localhost/api/roadmap",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(
          body
        ),
    }
  );
}

describe(
  "POST /api/roadmap integration",
  () => {
    beforeEach(
      async () => {
        /**
         * Keep every integration-test case independent even if more
         * cases are added to this suite later.
         */
        await careerDataService
          .resetMyData();
      }
    );

    it(
      "passes a valid questionnaire through the real integration flow",
      async () => {
        const request =
          createRequest(
            validQuestionnaire
          );

        const response =
          await POST(
            request
          );

        const body =
          await response.json();

        expect(
          response.status,
          JSON.stringify(
            body
          )
        ).toBe(200);

        expect(
          body.success
        ).toBe(true);

        expect(
          body.roadmap
        ).toBeDefined();

        expect(
          body.roadmap
            .targetRole
        ).toBe(
          validQuestionnaire
            .targetCareerRole
        );

        expect(
          body.roadmap
        ).toHaveProperty(
          "milestones"
        );

        /**
         * Contract regression checks.
         *
         * The route should return the roadmap itself rather than
         * accidentally nesting another response envelope.
         */
        expect(
          body.roadmap
        ).not.toHaveProperty(
          "success"
        );

        expect(
          body.roadmap
        ).not.toHaveProperty(
          "roadmap"
        );

        /**
         * Verify that the route actually persisted the questionnaire
         * through the real CareerDataService.
         */
        const savedQuestionnaire =
          await careerDataService
            .getMyQuestionnaire();

        expect(
          savedQuestionnaire
        ).not.toBeNull();

        expect(
          savedQuestionnaire
            ?.targetRole
        ).toBe(
          "Software Engineer"
        );

        expect(
          savedQuestionnaire
            ?.experienceLevel
        ).toBe(
          "beginner"
        );

        expect(
          savedQuestionnaire
            ?.weeklyHours
        ).toBe(8);

        /**
         * Verify that the generated roadmap was also persisted through
         * the same current-user service boundary.
         */
        const savedRoadmap =
          await careerDataService
            .getMyRoadmap();

        expect(
          savedRoadmap
        ).not.toBeNull();

        expect(
          savedRoadmap
            ?.targetRole
        ).toBe(
          "Software Engineer"
        );

        expect(
          savedRoadmap
            ?.milestones.length
        ).toBeGreaterThan(
          0
        );
      }
    );
  }
);