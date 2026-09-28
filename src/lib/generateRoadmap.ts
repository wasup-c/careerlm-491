import type {
  CareerRoadmap,
  QuestionnaireResponse,
} from "@/types/career";

/**
 * Generates a roadmap from a validated questionnaire.
 *
 * The API route is responsible for validating input before calling
 * this function. The actual roadmap-generation implementation will
 * be connected here when the team's generation service is available.
 */
export async function generateRoadmap(
  questionnaire: QuestionnaireResponse
): Promise<CareerRoadmap> {
  void questionnaire;

  throw new Error(
    "Roadmap generation service is not implemented yet."
  );
}