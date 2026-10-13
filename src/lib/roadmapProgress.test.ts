
import { describe, expect, it } from "vitest";
import { getRoadmapProgress } from "./roadmapProgress";
import type { RoadmapMilestone } from "@/types/career";

function createMilestone(
  status: RoadmapMilestone["status"],
  order = 1
): RoadmapMilestone {
  return {
    id: `milestone-${order}`,
    order,
    title: `Milestone ${order}`,
    description: "Test milestone",
    estimatedHours: 5,
    skills: ["TypeScript"],
    status,
  };
}

describe("getRoadmapProgress", () => {
  it("returns 0% when no milestones are completed", () => {
    const milestones = [
      createMilestone("not-started", 1),
      createMilestone("in-progress", 2),
      createMilestone("not-started", 3),
    ];

    expect(getRoadmapProgress(milestones)).toEqual({
      completedMilestones: 0,
      totalMilestones: 3,
      progressPercentage: 0,
    });
  });

  it("calculates partial completion correctly", () => {
    const milestones = [
      createMilestone("completed", 1),
      createMilestone("in-progress", 2),
      createMilestone("not-started", 3),
    ];

    expect(getRoadmapProgress(milestones)).toEqual({
      completedMilestones: 1,
      totalMilestones: 3,
      progressPercentage: 33,
    });
  });

  it("rounds two of three completed milestones to 67%", () => {
    const milestones = [
      createMilestone("completed", 1),
      createMilestone("completed", 2),
      createMilestone("not-started", 3),
    ];

    expect(getRoadmapProgress(milestones).progressPercentage).toBe(67);
  });

  it("returns 100% when all milestones are completed", () => {
    const milestones = [
      createMilestone("completed", 1),
      createMilestone("completed", 2),
    ];

    expect(getRoadmapProgress(milestones)).toEqual({
      completedMilestones: 2,
      totalMilestones: 2,
      progressPercentage: 100,
    });
  });

  it("handles an empty milestone collection safely", () => {
    expect(getRoadmapProgress([])).toEqual({
      completedMilestones: 0,
      totalMilestones: 0,
      progressPercentage: 0,
    });
  });

  it("does not count in-progress milestones as completed", () => {
    const milestones = [
      createMilestone("in-progress"),
    ];

    expect(getRoadmapProgress(milestones).progressPercentage).toBe(0);
  });

  it("recalculates progress after milestone completion", () => {
    const milestones = [
      createMilestone("not-started", 1),
      createMilestone("not-started", 2),
    ];

    const before = getRoadmapProgress(milestones);

    const updated = milestones.map((milestone) =>
      milestone.order === 1
        ? { ...milestone, status: "completed" as const }
        : milestone
    );

    const after = getRoadmapProgress(updated);

    expect(before.progressPercentage).toBe(0);
    expect(after.progressPercentage).toBe(50);
  });

  it("recalculates progress after a milestone is reopened", () => {
    const milestones = [
      createMilestone("completed", 1),
      createMilestone("completed", 2),
    ];

    const updated = milestones.map((milestone) =>
      milestone.order === 1
        ? { ...milestone, status: "not-started" as const }
        : milestone
    );

    expect(getRoadmapProgress(milestones).progressPercentage).toBe(100);
    expect(getRoadmapProgress(updated).progressPercentage).toBe(50);
  });

  it("supports milestones without optional IDs", () => {
    const milestone = createMilestone("completed");
    const { id: _id, ...withoutId } = milestone;
    void _id;

    expect(getRoadmapProgress([withoutId])).toEqual({
      completedMilestones: 1,
      totalMilestones: 1,
      progressPercentage: 100,
    });
  });

  it("does not modify the original milestone collection", () => {
    const milestones = [
      createMilestone("completed", 1),
      createMilestone("not-started", 2),
    ];

    const original = structuredClone(milestones);

    getRoadmapProgress(milestones);

    expect(milestones).toEqual(original);
  });
});
