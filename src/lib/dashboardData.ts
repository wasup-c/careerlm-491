import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProgressCard from "./ProgressCard";
import { sampleProgress } from "@/lib/fixtures/dashboard";

// SCRUM-162 [S3-M2-TEST] — ProgressCard rendering
describe("ProgressCard", () => {
  it("has an accessible Roadmap progress section", () => {
    render(<ProgressCard progress={sampleProgress} />);
    expect(
      screen.getByRole("region", { name: "Roadmap progress" }),
    ).toBeInTheDocument();
  });

  it("displays the supplied progress values without recalculating them", () => {
    render(<ProgressCard progress={sampleProgress} />);
    expect(screen.getByText("33%")).toBeInTheDocument();
    expect(
      screen.getByText("1 of 3 milestones completed"),
    ).toBeInTheDocument();
  });

  it("exposes an accessible progress bar with the supplied value", () => {
    render(<ProgressCard progress={sampleProgress} />);
    const bar = screen.getByRole("progressbar", { name: "Roadmap progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "33");
  });

  it("shows an empty state with an onboarding link when there is no roadmap", () => {
    render(<ProgressCard progress={null} />);
    expect(screen.getByText(/haven.t generated a roadmap/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Start onboarding" }),
    ).toHaveAttribute("href", "/onboarding");
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("treats a roadmap with zero milestones as empty", () => {
    render(
      <ProgressCard
        progress={{ completedMilestones: 0, totalMilestones: 0, progressPercentage: 0 }}
      />,
    );
    expect(screen.getByRole("link", { name: "Start onboarding" })).toBeInTheDocument();
  });

  it("keeps out-of-range percentages inside 0–100", () => {
    render(
      <ProgressCard
        progress={{ completedMilestones: 3, totalMilestones: 3, progressPercentage: 140 }}
      />,
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
