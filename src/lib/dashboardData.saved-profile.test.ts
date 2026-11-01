// @vitest-environment node

// SCRUM-231 [S4-M2-SEC-7] — CC6.1 finding F2: the dashboard shows the
// profile the current user saved, falls back to the questionnaire, and never
// shows another user's saved profile. All values below are synthetic.

import { describe, expect, it } from "vitest";

import { loadDashboardData } from "./dashboardData";
import { saveDashboardProfile } from "./profileSave";
import { DemoCurrentUserProvider } from "@/lib/auth";
import { InMemoryCareerRepository } from "@/lib/persistence/in-memory-repository";
import type { QuestionnaireInput } from "@/lib/persistence";
import { createDefaultCareerDataService } from "@/lib/services";

const questionnaire: QuestionnaireInput = {
  targetRole: "Frontend Developer",
  experienceLevel: "beginner",
  existingSkills: ["HTML", "CSS"],
  learningStyle: "projects",
  weeklyHours: 10,
};

function setup() {
  const repository = new InMemoryCareerRepository();
  const serviceFor = (userId: string) =>
    createDefaultCareerDataService({
      repository,
      currentUserProvider: new DemoCurrentUserProvider(userId),
    });
  return { userA: serviceFor("test-user-a"), userB: serviceFor("test-user-b") };
}

describe("SCRUM-231 — dashboard loads the saved profile", () => {
  it("shows questionnaire answers when no profile has been saved", async () => {
    const { userA } = setup();
    await userA.saveMyQuestionnaire(questionnaire);

    await expect(loadDashboardData(userA)).resolves.toMatchObject({
      profile: { targetRole: "Frontend Developer", experienceLevel: "beginner" },
    });
  });

  it("shows the saved profile instead of the questionnaire", async () => {
    const { userA } = setup();
    await userA.saveMyQuestionnaire(questionnaire);
    await userA.saveMyProfile({
      name: "Test User A",
      targetRole: "Full-Stack Developer",
      experienceLevel: "intermediate",
    });

    const { profile } = await loadDashboardData(userA);

    expect(profile).toEqual({
      name: "Test User A",
      targetRole: "Full-Stack Developer",
      experienceLevel: "intermediate",
    });
  });

  it("fills fields the saved profile leaves empty from the questionnaire", async () => {
    const { userA } = setup();
    await userA.saveMyQuestionnaire(questionnaire);
    await userA.saveMyProfile({ name: "Test User A" });

    const { profile } = await loadDashboardData(userA);

    expect(profile).toEqual({
      name: "Test User A",
      targetRole: "Frontend Developer",
      experienceLevel: "beginner",
    });
  });

  it("keeps an edit after a reload (save → load round trip)", async () => {
    const { userA } = setup();
    await userA.saveMyQuestionnaire(questionnaire);

    await saveDashboardProfile(userA, {
      name: "Test User A",
      targetRole: "Mobile Developer",
      experienceLevel: "advanced",
    });

    // A fresh load is what the dashboard does on refresh.
    const { profile } = await loadDashboardData(userA);
    expect(profile.targetRole).toBe("Mobile Developer");
    expect(profile.experienceLevel).toBe("advanced");
  });

  it("never shows another user's saved profile (AC-2)", async () => {
    const { userA, userB } = setup();
    await userA.saveMyQuestionnaire(questionnaire);
    await userB.saveMyProfile({
      name: "Test User B",
      targetRole: "Data Scientist",
      experienceLevel: "advanced",
    });

    const serialized = JSON.stringify(await loadDashboardData(userA));

    expect(serialized).not.toContain("Test User B");
    expect(serialized).not.toContain("Data Scientist");
  });
});
