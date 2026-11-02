
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  generateRoadmap: vi.fn(),
  saveMyQuestionnaire: vi.fn(),
  createOrReplaceMyRoadmap: vi.fn(),
}));

vi.mock("@/lib/generateRoadmap", () => ({
  generateRoadmap: mocks.generateRoadmap,
}));

vi.mock("@/lib/services/default-career-data-service", () => ({
  careerDataService: {
    saveMyQuestionnaire: mocks.saveMyQuestionnaire,
    createOrReplaceMyRoadmap: mocks.createOrReplaceMyRoadmap,
  },
}));

const validQuestionnaire = {
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

beforeEach(() => {
  vi.resetAllMocks();
  mocks.saveMyQuestionnaire.mockResolvedValue(undefined);
  mocks.createOrReplaceMyRoadmap.mockResolvedValue(undefined);
});

describe("SCRUM-238: CC7.1 roadmap security regression", () => {
  it("rejects malformed questionnaire data without invoking downstream operations", async () => {
    const response = await POST(
      createRequest({
        ...validQuestionnaire,
        targetCareerRole: "",
      })
    );

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");

    expect(mocks.saveMyQuestionnaire).not.toHaveBeenCalled();
    expect(mocks.generateRoadmap).not.toHaveBeenCalled();
    expect(mocks.createOrReplaceMyRoadmap).not.toHaveBeenCalled();
  });

  it("does not expose sensitive persistence errors", async () => {
    const sensitiveError =
      "SECRET_DATABASE_PASSWORD=example-secret";

    mocks.saveMyQuestionnaire.mockRejectedValueOnce(
      new Error(sensitiveError)
    );

    const response = await POST(
      createRequest(validQuestionnaire)
    );

    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("PERSISTENCE_FAILED");

    expect(JSON.stringify(body)).not.toContain(sensitiveError);
    expect(JSON.stringify(body)).not.toContain("stack");

    expect(mocks.generateRoadmap).not.toHaveBeenCalled();
    expect(mocks.createOrReplaceMyRoadmap).not.toHaveBeenCalled();
  });

  it("does not expose sensitive roadmap storage failures", async () => {
    const sensitiveError =
      "INTERNAL_STORAGE_PATH=/private/careerlm";

    mocks.generateRoadmap.mockResolvedValue({
      success: true,
      roadmap: {
        title: "Software Engineer Roadmap",
        targetRole: "Software Engineer",
        estimatedWeeks: 12,
        milestones: [],
      },
    });

    mocks.createOrReplaceMyRoadmap.mockRejectedValueOnce(
      new Error(sensitiveError)
    );

    const response = await POST(
      createRequest(validQuestionnaire)
    );

    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe("PERSISTENCE_FAILED");
    expect(JSON.stringify(body)).not.toContain(sensitiveError);
    expect(JSON.stringify(body)).not.toContain("stack");

    expect(mocks.saveMyQuestionnaire).toHaveBeenCalledTimes(1);
    expect(mocks.generateRoadmap).toHaveBeenCalledTimes(1);
    expect(mocks.createOrReplaceMyRoadmap).toHaveBeenCalledTimes(1);
  });
});
