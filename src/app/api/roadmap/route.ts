import { generateRoadmap } from "@/lib/generateRoadmap";
import { validateQuestionnaire } from "@/lib/validation/questionnaire";
import type { GenerateRoadmapResponse } from "@/types/career";

export async function POST(
  request: Request
): Promise<Response> {
  let body: unknown;

  // Parse incoming JSON safely.
  try {
    body = await request.json();
  } catch {
    const responseBody: GenerateRoadmapResponse = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request body must contain valid JSON.",
      },
    };

    return Response.json(responseBody, {
      status: 400,
    });
  }

  // Validate the questionnaire before any generation occurs.
  const validation = validateQuestionnaire(body);

  if (!validation.valid) {
    const responseBody: GenerateRoadmapResponse = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Questionnaire validation failed.",
        fieldErrors: validation.fieldErrors,
      },
    };

    return Response.json(responseBody, {
      status: 400,
    });
  }

  // Input is now validated and safe to pass to generation.
  try {
    const roadmap = await generateRoadmap(validation.data);

    return Response.json(
      {
        success: true,
        roadmap,
      },
      {
        status: 200,
      }
    );
  } catch {
    const responseBody: GenerateRoadmapResponse = {
      success: false,
      error: {
        code: "GENERATION_FAILED",
        message: "Roadmap generation failed.",
      },
    };

    return Response.json(responseBody, {
      status: 500,
    });
  }
}