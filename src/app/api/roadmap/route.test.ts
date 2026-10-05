import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

import type {
  CareerRoadmap,
  QuestionnaireResponse,
} from "@/types/career";

const mocks = vi.hoisted(() => ({
  generateRoadmap: vi.fn(),
}));

vi.mock("@/lib/generateRoadmap", () => ({
  generateRoadmap: mocks.generateRoadmap,
}));


const validQuestionnaire: QuestionnaireResponse = {
  targetCareerRole: "Software Engineer",
  experienceLevel: "Beginner (little to no experience)",
  weeklyTimeCommitment: "5-10 hours",
  targetTimeline: "3-6 months",
  preferredLearningStyle: ["Hands-on projects"],
};
const generatedRoadmap: CareerRoadmap = {
  title: "Software Engineer Career Roadmap",
  targetRole: "Software Engineer",
  estimatedWeeks: 12,
  milestones: [],
};

function createJsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/roadmap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function callRoute(body: unknown) {
  const response = await POST(createJsonRequest(body));
  const json = await response.json();

  return {
    response,
    body: json,
  };
}

describe("POST /api/roadmap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("questionnaire validation", () => {
    it.each([
      [
        "missing target career role",
        { targetCareerRole: "" },
        "targetCareerRole",
      ],
      [
        "invalid experience level",
        { experienceLevel: "Invalid" },
        "experienceLevel",
      ],
      [
        "invalid weekly commitment",
        { weeklyTimeCommitment: "ten" },
        "weeklyTimeCommitment",
      ],
      [
        "invalid target timeline",
        { targetTimeline: "Tomorrow" },
        "targetTimeline",
      ],
    ])(
      "returns 400 for %s",
      async (_name, override, expectedField) => {
        const { response, body } = await callRoute({
          ...validQuestionnaire,
          ...override,
        });

        expect(response.status).toBe(400);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("VALIDATION_ERROR");

        expect(body.error.fieldErrors).toHaveProperty(
          expectedField
        );
      }
    );

    it("returns multiple field errors together", async () => {
      const { response, body } = await callRoute({
        ...validQuestionnaire,
        targetCareerRole: "",
        experienceLevel: "Invalid",
        weeklyTimeCommitment: "ten",
      });

      expect(response.status).toBe(400);

      expect(body.error.fieldErrors).toHaveProperty(
        "targetCareerRole"
      );

      expect(body.error.fieldErrors).toHaveProperty(
        "experienceLevel"
      );

      expect(body.error.fieldErrors).toHaveProperty(
        "weeklyTimeCommitment"
      );
    });
  });


  describe("invalid request bodies", () => {
    it.each([
      ["null", null],
      ["array", []],
      ["string", "hello"],
      ["number", 42],
    ])(
      "returns controlled validation error for %s body",
      async (_name, input) => {
        const { response, body } = await callRoute(input);

        expect(response.status).toBe(400);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("VALIDATION_ERROR");

        expect(body).not.toHaveProperty("stack");
        expect(body.error).not.toHaveProperty("stack");
      }
    );

    it("returns controlled error for malformed JSON", async () => {
      const request = new Request(
        "http://localhost/api/roadmap",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: '{"targetCareerRole":',
        }
      );

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("VALIDATION_ERROR");

      expect(body).not.toHaveProperty("stack");
      expect(body.error).not.toHaveProperty("stack");
    });
  });

  describe("orchestration", () => {
    it("does not call generator when validation fails", async () => {
      const { response } = await callRoute({
        ...validQuestionnaire,
        targetCareerRole: "",
      });

      expect(response.status).toBe(400);
      expect(mocks.generateRoadmap).not.toHaveBeenCalled();
    });
    it("returns controlled error when roadmap generation fails", async () => {
      mocks.generateRoadmap.mockRejectedValue(
        new Error("Internal generator failure")
      );

      const { response, body } =
        await callRoute(validQuestionnaire);

      expect(response.status).toBe(500);

      expect(body).toEqual({
        success: false,
        error: {
          code: "GENERATION_FAILED",
          message: "Roadmap generation failed.",
        },
      });

      expect(body.error.message).not.toContain(
        "Internal generator failure"
      );

      expect(body.error).not.toHaveProperty("stack");
    });
    it("calls generator after validation succeeds", async () => {
      mocks.generateRoadmap.mockResolvedValue(
        {
          success: true,
          roadmap: generatedRoadmap,
        }
      );

      const { response, body } =
        await callRoute(validQuestionnaire);

      expect(response.status).toBe(200);

      expect(mocks.generateRoadmap).toHaveBeenCalledTimes(1);

      expect(mocks.generateRoadmap).toHaveBeenCalledWith(
        validQuestionnaire
      );

      expect(body).toEqual({
        success: true,
        roadmap: generatedRoadmap,
      });
    });
    it("passes the validated questionnaire to the generator", async () => {
      mocks.generateRoadmap.mockReturnValue(
        {
          success: true,
          roadmap: generatedRoadmap,
        }
      );

      await callRoute(validQuestionnaire);

      expect(mocks.generateRoadmap).toHaveBeenCalledWith(
        validQuestionnaire
      );
    });
    it("returns the generated roadmap on success", async () => {
      mocks.generateRoadmap.mockReturnValue(
        {
          success: true,
          roadmap: generatedRoadmap,
        }
      );

      const { response, body } =
        await callRoute(validQuestionnaire);

      expect(response.status).toBe(200);

      expect(body).toEqual({
        success: true,
        roadmap: generatedRoadmap,
      });
    });
    it("returns a controlled error when generation fails", async () => {
      mocks.generateRoadmap.mockImplementation(() => {
        throw new Error("Sensitive internal generation failure");
      });

      const { response, body } =
        await callRoute(validQuestionnaire);

      expect(response.status).toBe(500);

      expect(body).toEqual({
        success: false,
        error: {
          code: "GENERATION_FAILED",
          message: "Roadmap generation failed.",
        },
      });
    });
    it("does not expose internal generation errors", async () => {
      mocks.generateRoadmap.mockImplementation(() => {
        throw new Error(
          "Sensitive internal generation failure"
        );
      });

      const { body } =
        await callRoute(validQuestionnaire);

      expect(JSON.stringify(body)).not.toContain(
        "Sensitive internal generation failure"
      );
    });
  });
});
