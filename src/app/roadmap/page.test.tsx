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