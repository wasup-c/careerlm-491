import { describe, expect, it } from "vitest";

import { getDashboardData, toDashboardProgress } from "./dashboardData";
import { completeProfile } from "@/lib/fixtures/dashboard";
import { mockRoadmap } from "@/lib/mockRoadmap";
import type { CareerRoadmap } from "@/types/career";

// SCRUM-162 [S3-M2-TEST] — dashboard data wiring
describe("toDashboardProgress", () => {
  it("maps Member 4's progress result into the dashboard shape", () => {
    expect(toDashboardProgress(mockRoadmap)).toEqual({
      completedMilestones: 1,
      totalMilestones: 3,
      percentComplete: 33,
    });
  });

  it("returns null when there is no roadmap", () => {
    expect(toDashboardProgress(null)).toBeNull();
  });

  it("reports zero milestones for an empty roadmap", () => {
    const empty: CareerRoadmap = { ...mockRoadmap, milestones: [] };
    expect(toDashboardProgress(empty)).toEqual({
      completedMilestones: 0,
      totalMilestones: 0,
      percentComplete: 0,
    });
  });
});

describe("getDashboardData", () => {
  it("uses the roadmap's target role so the dashboard matches /roadmap", () => {
    const { profile } = getDashboardData();
    expect(profile.targetRole).toBe(mockRoadmap.targetRole);
    expect(profile.name).toBe(completeProfile.name);
  });

  it("falls back to fixture profile data when there is no roadmap", () => {
    expect(getDashboardData(null)).toEqual({
      profile: completeProfile,
      progress: null,
    });
  });
});
