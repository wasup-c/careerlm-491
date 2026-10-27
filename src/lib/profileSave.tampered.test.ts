// @vitest-environment node

// SCRUM-227 [S4-M2-SEC-4] — SOC 2 CC6.1 T5 (AC-5): a forged userId in a
// profile save must never change another user's profile.
// All users and values below are synthetic test data.

import { describe, expect, it } from "vitest";

import { saveDashboardProfile } from "./profileSave";
import { DemoCurrentUserProvider } from "@/lib/auth";
import { InMemoryCareerRepository } from "@/lib/persistence/in-memory-repository";
import { createDefaultCareerDataService } from "@/lib/services";

async function seedTwoUsers() {
  const repository = new InMemoryCareerRepository();

  const serviceFor = (userId: string) =>
    createDefaultCareerDataService({
      repository,
      currentUserProvider: new DemoCurrentUserProvider(userId),
    });

  const userA = serviceFor("test-user-a");
  const userB = serviceFor("test-user-b");

  await userA.saveMyProfile({
    name: "Test User A",
    targetRole: "Frontend Developer",
    experienceLevel: "beginner",
  });
  await userB.saveMyProfile({
    name: "Test User B",
    targetRole: "Data Scientist",
    experienceLevel: "advanced",
  });

  return { userA, userB };
}

describe("CC6.1 T5 — tampered profile save (AC-5)", () => {
  it("ignores a forged userId and updates only the current user's profile", async () => {
    const { userA, userB } = await seedTwoUsers();
    const userBBefore = await userB.getMyProfile();

    // Signed in as User A, but the request claims to be User B.
    const result = await saveDashboardProfile(userA, {
      userId: "test-user-b",
      name: "Hijacked",
      targetRole: "Attacker Role",
      experienceLevel: "advanced",
    });

    expect(result.ok).toBe(true);

    // User A's profile received the change.
    await expect(userA.getMyProfile()).resolves.toMatchObject({
      userId: "test-user-a",
      name: "Hijacked",
      targetRole: "Attacker Role",
    });

    // User B's profile is exactly as it was before the request.
    await expect(userB.getMyProfile()).resolves.toEqual(userBBefore);
  });

  it("does not let extra fields override the stored owner", async () => {
    const { userA } = await seedTwoUsers();

    await saveDashboardProfile(userA, {
      targetRole: "Frontend Developer",
      userId: "test-user-b",
      schemaVersion: 99,
    });

    const saved = await userA.getMyProfile();
    expect(saved?.userId).toBe("test-user-a");
    expect(saved?.schemaVersion).toBe(1);
  });
});
