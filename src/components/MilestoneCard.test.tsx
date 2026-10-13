
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import MilestoneCard from "./MilestoneCard";
import type { RoadmapMilestone } from "@/types/career";

const baseMilestone: RoadmapMilestone = {
  id: "milestone-1",
  order: 1,
  title: "Build a TypeScript Project",
  description: "Create a project using TypeScript.",
  estimatedHours: 12,
  skills: ["TypeScript", "React"],
  status: "not-started",
};

describe("MilestoneCard regression tests", () => {
  it.each([
    ["not-started", "Not started"],
    ["in-progress", "In progress"],
    ["completed", "Completed"],
  ] as const)(
    "renders %s status correctly",
    (status, label) => {
      render(
        <MilestoneCard
          milestone={{ ...baseMilestone, status }}
          position={1}
        />
      );

      expect(screen.getByText(label)).toBeDefined();
    }
  );

  it("renders milestone details from the shared contract", () => {
    render(
      <MilestoneCard
        milestone={baseMilestone}
        position={1}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Build a TypeScript Project",
      })
    ).toBeDefined();

    expect(
      screen.getByText("Create a project using TypeScript.")
    ).toBeDefined();

    expect(screen.getByText("TypeScript")).toBeDefined();
    expect(screen.getByText("React")).toBeDefined();
    expect(screen.getByText(/12 hours/)).toBeDefined();
  });

  it("uses the supplied milestone position", () => {
    render(
      <MilestoneCard
        milestone={baseMilestone}
        position={3}
      />
    );

    expect(screen.getByText("Milestone 3")).toBeDefined();
  });

  it("renders an empty skills list without crashing", () => {
    render(
      <MilestoneCard
        milestone={{ ...baseMilestone, skills: [] }}
        position={1}
      />
    );

    expect(
      screen.getByRole("list", { name: "Milestone skills" })
    ).toBeDefined();

    expect(
      screen.queryAllByRole("listitem")
    ).toHaveLength(0);
  });
});
