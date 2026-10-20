// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import {
  loadDashboardData,
  toDashboardProfile,
  toDashboardProgress,
} from "./dashboardData";
import { DemoCurrentUserProvider } from "@/lib/auth";
import { InMemoryCareerRepository } from "@/lib/persistence/in-memory-repository";
import type { QuestionnaireInput } from "@/lib/persistence";
import { createDefaultCareerDataService } from "@/lib/services";
import { mockRoadmap } from "@/lib/mockRoadmap";

// SCRUM-162 [S3-M2-TEST] — dashboard reads saved data through CareerDataService

const questionnaire: QuestionnaireInput = {
  targetRole: "Frontend Developer",
  experienceLevel: "beginner",
  existingSkills: ["HTML", "CSS"],
  learningStyle: "projects",
  weeklyHours: 10,
};

function createService() {
  return createDefaultCareerDataService({
    repository: new InMemoryCareerRepository(),
    currentUserProvider: new DemoCurrentUserProvider("test-user"),
  });
}

describe("toDashboardProgress", () => {
  it("returns Member 4's RoadmapProgress unchanged", () => {
    expect(toDashboardProgress(mockRoadmap)).toEqual({
      completedMilestones: 1,
      totalMilestones: 3,
      progressPercentage: 33,
    });
  });

  it("returns null when there is no roadmap", () => {
    expect(toDashboardProgress(null)).toBeNull();
  });

  it("reports zero milestones for an empty roadmap", () => {
    expect(toDashboardProgress({ milestones: [] })).toEqual({
      completedMilestones: 0,
      totalMilestones: 0,
      progressPercentage: 0,
    });
  });
});

describe("toDashboardProfile", () => {
  it("returns an empty profile when nothing is saved", () => {
    expect(toDashboardProfile(null)).toEqual({});
  });
});

describe("loadDashboardData", () => {
  it("shows empty states for a user with no saved data", async () => {
    await expect(loadDashboardData(createService())).resolves.toEqual({
      profile: {},
      progress: null,
    });
  });

  it("reads the saved questionnaire and roadmap", async () => {
    const service = createService();
    await service.saveMyQuestionnaire(questionnaire);
    await service.createOrReplaceMyRoadmap(mockRoadmap);

    await expect(loadDashboardData(service)).resolves.toEqual({
      profile: { targetRole: "Frontend Developer", experienceLevel: "beginner" },
      progress: { completedMilestones: 1, totalMilestones: 3, progressPercentage: 33 },
    });
  });

  it("passes service errors through to the dashboard error boundary", async () => {
    const service = {
      getMyQuestionnaire: vi.fn().mockRejectedValue(new Error("storage down")),
      getMyRoadmap: vi.fn().mockResolvedValue(null),
    };
    await expect(loadDashboardData(service)).rejects.toThrow("storage down");
  });
});
