import { describe, expect, it } from "vitest";
import { POST } from "./route";
import type { QuestionnaireResponse } from "@/types/career";

const validQuestionnaire: QuestionnaireResponse = {
  targetCareerRole: "Software Engineer",
  experienceLevel: "Beginner (little to no experience)",
  weeklyTimeCommitment: "5-10 hours",
  targetTimeline: "3-6 months",
  preferredLearningStyle: ["Hands-on projects"],
};

function createRequest(body: unknown): Request {
  return new Request("http://localhost/api/roadmap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/roadmap integration", () => {
  it("passes a valid questionnaire through the real generator", async () => {
    const request = createRequest(validQuestionnaire);

    const response = await POST(request);
    const body = await response.json();

    expect(response.status, JSON.stringify(body)).toBe(200);
    expect(body.success).toBe(true);

    expect(body.roadmap).toBeDefined();

    expect(body.roadmap.targetRole).toBe(
      validQuestionnaire.targetCareerRole
    );

    expect(body.roadmap).toHaveProperty("milestones");

    // Contract regression checks
    expect(body.roadmap).not.toHaveProperty("success");
    expect(body.roadmap).not.toHaveProperty("roadmap");
  });
});