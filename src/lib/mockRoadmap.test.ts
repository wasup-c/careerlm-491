import { describe, expect, it } from "vitest";

import { mockRoadmap } from "@/lib/mockRoadmap";

import type {
  MilestoneStatus,
  RoadmapInput,
} from "@/lib/persistence/domain";

const validStatuses: MilestoneStatus[] = [
  "not-started",
  "in-progress",
  "completed",
];

describe("mockRoadmap", () => {
  it("satisfies the shared roadmap persistence contract", () => {
    const persistenceCompatibleRoadmap: RoadmapInput =
      mockRoadmap;

    expect(persistenceCompatibleRoadmap.title.trim()).not.toBe(
      ""
    );
    expect(
      persistenceCompatibleRoadmap.targetRole.trim()
    ).not.toBe("");
    expect(
      persistenceCompatibleRoadmap.estimatedWeeks
    ).toBeGreaterThan(0);
    expect(
      persistenceCompatibleRoadmap.milestones.length
    ).toBeGreaterThan(0);
  });

  it("contains unique milestone ids when ids are provided", () => {
    const milestoneIds = mockRoadmap.milestones
      .map((milestone) => milestone.id)
      .filter((id): id is string => id !== undefined);

    expect(new Set(milestoneIds).size).toBe(
      milestoneIds.length
    );
  });

  it("provides all required shared fields for every milestone", () => {
    mockRoadmap.milestones.forEach((milestone) => {
      expect(milestone.order).toBeGreaterThan(0);
      expect(milestone.title.trim()).not.toBe("");
      expect(milestone.description.trim()).not.toBe("");
      expect(milestone.estimatedHours).toBeGreaterThan(0);
      expect(milestone.skills.length).toBeGreaterThan(0);
      expect(validStatuses).toContain(milestone.status);
    });
  });

  it("contains milestones in sequential order", () => {
    const orders = mockRoadmap.milestones.map(
      (milestone) => milestone.order
    );

    expect(orders).toEqual(
      mockRoadmap.milestones.map(
        (_, index) => index + 1
      )
    );
  });

  it("contains unique milestone order values", () => {
    const orders = mockRoadmap.milestones.map(
      (milestone) => milestone.order
    );

    expect(new Set(orders).size).toBe(orders.length);
  });

  it("uses only supported milestone statuses", () => {
    mockRoadmap.milestones.forEach((milestone) => {
      expect(validStatuses).toContain(milestone.status);
    });
  });

  it("does not store progressPercentage in the shared roadmap", () => {
    expect(mockRoadmap).not.toHaveProperty(
      "progressPercentage"
    );
  });

  it("does not use the old estimatedTime milestone field", () => {
    mockRoadmap.milestones.forEach((milestone) => {
      expect(milestone).not.toHaveProperty("estimatedTime");
    });
  });

  it("does not persist UI-only additionalInfo in milestones", () => {
    mockRoadmap.milestones.forEach((milestone) => {
      expect(milestone).not.toHaveProperty(
        "additionalInfo"
      );
    });
  });
});
