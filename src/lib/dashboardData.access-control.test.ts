// @vitest-environment node

// SCRUM-225 [S4-M2-SEC-2] — SOC 2 CC6.1 access-control tests for the dashboard
// data loader. Covers T1 (AC-1), T2 (AC-2), and T3 (AC-3) from the Sprint 4
// CC6.1 assessment. All users and values below are synthetic test data.

import { describe, expect, it } from "vitest";

import { loadDashboardData } from "./dashboardData";
import {
  AuthenticationRequiredError,
  DemoCurrentUserProvider,
  type CurrentUserProvider,
} from "@/lib/auth";
import { InMemoryCareerRepository } from "@/lib/persistence/in-memory-repository";
import type { QuestionnaireInput } from "@/lib/persistence";
import { createDefaultCareerDataService } from "@/lib/services";
import { mockRoadmap } from "@/lib/mockRoadmap";

const userAQuestionnaire: QuestionnaireInput = {
  targetRole: "Frontend Developer",
  experienceLevel: "beginner",
  existingSkills: ["HTML", "CSS"],
  learningStyle: "projects",
  weeklyHours: 10,
};

const userBQuestionnaire: QuestionnaireInput = {
  targetRole: "Data Scientist",
  experienceLevel: "advanced",
  existingSkills: ["Python", "SQL"],
  learningStyle: "reading",
  weeklyHours: 20,
};

// User B finishes every milestone, so B's progress (100%) is easy to tell
// apart from User A's (1 of 3 completed, 33%).
const userBRoadmap = {
  ...mockRoadmap,
  title: "Data Scientist Career Roadmap",
  targetRole: "Data Scientist",
  milestones: mockRoadmap.milestones.map((milestone) => ({
    ...milestone,
    status: "completed" as const,
  })),
};

/** One shared repository, with a separate service per synthetic user. */
async function seedTwoUsers() {
  const repository = new InMemoryCareerRepository();

  const serviceFor = (userId: string) =>
    createDefaultCareerDataService({
      repository,
      currentUserProvider: new DemoCurrentUserProvider(userId),
    });

  const userA = serviceFor("test-user-a");
  const userB = serviceFor("test-user-b");

  await userA.saveMyQuestionnaire(userAQuestionnaire);
  await userA.createOrReplaceMyRoadmap(mockRoadmap);

  await userB.saveMyQuestionnaire(userBQuestionnaire);
  await userB.createOrReplaceMyRoadmap(userBRoadmap);

  return { repository, userA, userB };
}

describe("CC6.1 T1 — missing current user (AC-1)", () => {
  it("rejects with AuthenticationRequiredError when there is no current user", async () => {
    const repository = new InMemoryCareerRepository();

    // Seed data that must NOT leak to an unauthenticated caller.
    await createDefaultCareerDataService({
      repository,
      currentUserProvider: new DemoCurrentUserProvider("test-user-a"),
    }).saveMyQuestionnaire(userAQuestionnaire);

    const noUser: CurrentUserProvider = {
      getCurrentUser: async () => null,
    };
    const service = createDefaultCareerDataService({
      repository,
      currentUserProvider: noUser,
    });

    await expect(loadDashboardData(service)).rejects.toBeInstanceOf(
      AuthenticationRequiredError,
    );
  });

  it("rejects with AuthenticationRequiredError when the session has a blank user ID", async () => {
    const blankUser: CurrentUserProvider = {
      getCurrentUser: async () => ({ id: "   " }),
    };
    const service = createDefaultCareerDataService({
      repository: new InMemoryCareerRepository(),
      currentUserProvider: blankUser,
    });

    await expect(loadDashboardData(service)).rejects.toBeInstanceOf(
      AuthenticationRequiredError,
    );
  });
});

describe("CC6.1 T2 — cross-user isolation (AC-2)", () => {
  it("never returns User B's profile or progress when loading as User A", async () => {
    const { userA } = await seedTwoUsers();

    const data = await loadDashboardData(userA);
    const serialized = JSON.stringify(data);

    expect(serialized).not.toContain("Data Scientist");
    expect(serialized).not.toContain("advanced");
    expect(data.progress?.progressPercentage).not.toBe(100);
  });

  it("keeps User B's data unchanged after User A loads the dashboard", async () => {
    const { userA, userB } = await seedTwoUsers();

    await loadDashboardData(userA);

    await expect(loadDashboardData(userB)).resolves.toEqual({
      profile: { targetRole: "Data Scientist", experienceLevel: "advanced" },
      progress: {
        completedMilestones: 3,
        totalMilestones: 3,
        progressPercentage: 100,
      },
    });
  });
});

describe("CC6.1 T3 — authorized access to own data (AC-3)", () => {
  it("returns User A's own target role, experience level, and progress", async () => {
    const { userA } = await seedTwoUsers();

    await expect(loadDashboardData(userA)).resolves.toEqual({
      profile: { targetRole: "Frontend Developer", experienceLevel: "beginner" },
      progress: {
        completedMilestones: 1,
        totalMilestones: 3,
        progressPercentage: 33,
      },
    });
  });
});
