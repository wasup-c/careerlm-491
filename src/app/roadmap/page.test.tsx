
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import type { CareerRoadmap } from "@/types/career";

const mocks = vi.hoisted(() => ({
  roadmap: {
    title: "Test Career Roadmap",
    targetRole: "Software Engineer",
    estimatedWeeks: 12,
    milestones: [
      {
        id: "third",
        order: 3,
        title: "Third Milestone",
        description: "Third milestone description",
        estimatedHours: 8,
        skills: ["React"],
        status: "not-started",
      },
      {
        id: "first",
        order: 1,
        title: "First Milestone",
        description: "First milestone description",
        estimatedHours: 5,
        skills: ["HTML"],
        status: "completed",
      },
      {
        id: "second",
        order: 2,
        title: "Second Milestone",
        description: "Second milestone description",
        estimatedHours: 6,
        skills: ["TypeScript"],
        status: "in-progress",
      },
    ],
  } satisfies CareerRoadmap,
}));

vi.mock("@/lib/mockRoadmap", () => ({
  mockRoadmap: mocks.roadmap,
}));

vi.mock("@/components/SharedLayout", () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

import RoadmapPage from "./page";

describe("RoadmapPage regression tests", () => {
  it("renders the target role and estimated duration", () => {
    render(<RoadmapPage />);

    expect(
      screen.getByRole("heading", {
        name: "Your path to Software Engineer",
      })
    ).toBeDefined();

    expect(screen.getByText("12 weeks")).toBeDefined();
  });

  it("renders milestones in ascending order", () => {
    render(<RoadmapPage />);

    const headings = screen.getAllByRole("heading", {
      level: 2,
    });

    expect(headings.map((heading) => heading.textContent)).toEqual([
      "First Milestone",
      "Second Milestone",
      "Third Milestone",
    ]);
  });

  it("renders progress based on completed milestones", () => {
    render(<RoadmapPage />);

    const progressbar = screen.getByRole("progressbar", {
      name: "Roadmap progress",
    });

    expect(progressbar.getAttribute("aria-valuenow")).toBe("33");
    expect(progressbar.getAttribute("aria-valuemin")).toBe("0");
    expect(progressbar.getAttribute("aria-valuemax")).toBe("100");
  });

  it("preserves the portfolio navigation link", () => {
    render(<RoadmapPage />);

    const link = screen.getByRole("link", {
      name: "View portfolio",
    });

    expect(link.getAttribute("href")).toBe("/portfolio");
  });
});
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import RoadmapPage from "./page";

describe("RoadmapPage portfolio journey handoff", () => {
  it("provides a path from the roadmap to the portfolio", () => {
    render(<RoadmapPage />);

    const portfolioLink = screen.getByRole("link", {
      name: /view portfolio/i,
    });

    expect(portfolioLink).toHaveAttribute("href", "/portfolio");
  });
});
