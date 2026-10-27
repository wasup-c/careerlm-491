// @vitest-environment node

// SCRUM-226 [S4-M2-SEC-3] — tests for the real, current-user-scoped profile
// save that replaces mockSaveProfile on the dashboard (CC6.1 finding F1).
// All users and values below are synthetic test data.

import { describe, expect, it } from "vitest";

import { saveDashboardProfile, toProfileInput } from "./profileSave";
import { DemoCurrentUserProvider, type CurrentUserProvider } from "@/lib/auth";
import { InMemoryCareerRepository } from "@/lib/persistence/in-memory-repository";
import { createDefaultCareerDataService } from "@/lib/services";

function serviceFor(
  repository: InMemoryCareerRepository,
  currentUserProvider: CurrentUserProvider,
) {
  return createDefaultCareerDataService({ repository, currentUserProvider });
}

describe("toProfileInput", () => {
  it("keeps only the editable profile fields", () => {
    expect(
      toProfileInput({
        name: "  Test User A ",
        targetRole: "Frontend Developer",
        experienceLevel: "beginner",
        userId: "someone-else",
        isAdmin: true,
      }),
    ).toEqual({
      name: "Test User A",
      targetRole: "Frontend Developer",
      experienceLevel: "beginner",
    });
  });

  it("drops blank strings, non-strings, and unknown experience levels", () => {
    expect(
      toProfileInput({ name: "   ", targetRole: 42, experienceLevel: "expert" }),
    ).toEqual({
      name: undefined,
      targetRole: undefined,
      experienceLevel: undefined,
    });
  });

  it("treats non-object input as an empty profile", () => {
    expect(toProfileInput(null)).toEqual({
      name: undefined,
      targetRole: undefined,
      experienceLevel: undefined,
    });
  });
});

describe("saveDashboardProfile", () => {
  it("saves the profile for the current user", async () => {
    const repository = new InMemoryCareerRepository();
    const service = serviceFor(
      repository,
      new DemoCurrentUserProvider("test-user-a"),
    );

    const result = await saveDashboardProfile(service, {
      name: "Test User A",
      targetRole: "Frontend Developer",
      experienceLevel: "intermediate",
    });

    expect(result).toEqual({
      ok: true,
      profile: {
        name: "Test User A",
        targetRole: "Frontend Developer",
        experienceLevel: "intermediate",
      },
    });

    await expect(service.getMyProfile()).resolves.toMatchObject({
      userId: "test-user-a",
      targetRole: "Frontend Developer",
    });
  });

  it("returns a field error and saves nothing when target role is missing", async () => {
    const repository = new InMemoryCareerRepository();
    const service = serviceFor(
      repository,
      new DemoCurrentUserProvider("test-user-a"),
    );

    const result = await saveDashboardProfile(service, { name: "Test User A" });

    expect(result).toEqual({
      ok: false,
      message: "Some fields need attention.",
      fieldErrors: { targetRole: "Target role is required." },
    });
    await expect(service.getMyProfile()).resolves.toBeNull();
  });

  it("refuses to save when there is no current user (AC-1)", async () => {
    const noUser: CurrentUserProvider = { getCurrentUser: async () => null };
    const service = serviceFor(new InMemoryCareerRepository(), noUser);

    const result = await saveDashboardProfile(service, {
      targetRole: "Frontend Developer",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/sign in/i);
  });

  it("returns a safe message instead of throwing when storage fails", async () => {
    const failing = {
      saveMyProfile: async () => {
        throw new Error("disk full");
      },
    };

    const result = await saveDashboardProfile(failing, {
      targetRole: "Frontend Developer",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).not.toContain("disk full");
  });
});
