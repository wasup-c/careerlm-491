import { describe, expect, it } from "vitest";

import { mockRoadmap } from "@/lib/mockRoadmap";
import { getCompletedPortfolioWork } from "@/lib/portfolioJourney";
import type { CareerRoadmap } from "@/types/career";

describe("getCompletedPortfolioWork", () => {
  it("returns only roadmap work already marked as completed", () => {
    const completedWork = getCompletedPortfolioWork(mockRoadmap);

    expect(completedWork).toHaveLength(1);
    expect(completedWork[0].title).toBe(
      "Strengthen HTML and CSS fundamentals",
    );
  });

  it("returns an empty collection when no completed work is available", () => {
    const roadmapWithNoCompletedWork: CareerRoadmap = {
      ...mockRoadmap,
      milestones: mockRoadmap.milestones.map((milestone) => ({
        ...milestone,
        status: "not-started" as const,
      })),
    };

    const completedWork = getCompletedPortfolioWork(
      roadmapWithNoCompletedWork,
    );

    expect(completedWork).toEqual([]);
  });

  it("does not include in-progress or not-started work", () => {
    const completedWork = getCompletedPortfolioWork(mockRoadmap);

    const titles = completedWork.map((milestone) => milestone.title);

    expect(titles).not.toContain(
      "Build confidence with JavaScript and TypeScript",
    );

    expect(titles).not.toContain(
      "Create projects with React and Next.js",
    );
  });
});