import {
  generateRoadmap,
} from "@/lib/generateRoadmap";

import {
  mapQuestionnaireToPersistence,
} from "@/lib/integration/questionnaire-persistence-mapper";

import {
  careerDataService,
} from "@/lib/services/default-career-data-service";

import {
  validateQuestionnaire,
} from "@/lib/validation/questionnaire";

import type {
  GenerateRoadmapResponse,
} from "@/types/career";

/**
 * Returns a controlled persistence failure without exposing filesystem,
 * repository, session, or other infrastructure details to API callers.
 */
function createPersistenceFailureResponse():
  Response {
  const responseBody:
    GenerateRoadmapResponse = {
      success: false,
      error: {
        code:
          "PERSISTENCE_FAILED",

        message:
          "CareerLM could not save your roadmap data. Please try again.",
      },
    };

  return Response.json(
    responseBody,
    {
      status: 500,
    }
  );
}

export async function POST(
  request: Request
): Promise<Response> {
  let body: unknown;

  // Parse incoming JSON safely.
  try {
    body =
      await request.json();
  } catch {
    const responseBody:
      GenerateRoadmapResponse = {
        success: false,
        error: {
          code:
            "VALIDATION_ERROR",

          message:
            "Request body must contain valid JSON.",
        },
      };

    return Response.json(
      responseBody,
      {
        status: 400,
      }
    );
  }

  /**
   * Member 3 validation remains the application/API validation boundary.
   *
   * Persistence receives only questionnaire data that has already passed
   * the existing questionnaire contract.
   */
  const validation =
    validateQuestionnaire(body);

  if (!validation.valid) {
    const responseBody:
      GenerateRoadmapResponse = {
        success: false,
        error: {
          code:
            "VALIDATION_ERROR",

          message:
            "Questionnaire validation failed.",

          fieldErrors:
            validation.fieldErrors,
        },
      };

    return Response.json(
      responseBody,
      {
        status: 400,
      }
    );
  }

  /**
   * Persist the validated questionnaire through Member 1's session-aware
   * data-access boundary.
   *
   * The API never selects a repository user ID directly.
   */
  try {
    const questionnaireInput =
      mapQuestionnaireToPersistence(
        validation.data
      );

    await careerDataService
      .saveMyQuestionnaire(
        questionnaireInput
      );
  } catch {
    return createPersistenceFailureResponse();
  }

  /**
   * Generate the roadmap using the existing generation boundary.
   */
  let generationResult:
    GenerateRoadmapResponse;

  try {
    generationResult =
      await generateRoadmap(
        validation.data
      );
  } catch {
    const responseBody:
      GenerateRoadmapResponse = {
        success: false,
        error: {
          code:
            "GENERATION_FAILED",

          message:
            "Roadmap generation failed.",
        },
      };

    return Response.json(
      responseBody,
      {
        status: 500,
      }
    );
  }

  if (!generationResult.success) {
    return Response.json(
      generationResult,
      {
        status: 500,
      }
    );
  }

  /**
   * Persist the successfully generated roadmap for the same current user.
   */
  try {
    await careerDataService
      .createOrReplaceMyRoadmap(
        generationResult.roadmap
      );
  } catch {
    return createPersistenceFailureResponse();
  }

  return Response.json(
    generationResult,
    {
      status: 200,
    }
  );
}