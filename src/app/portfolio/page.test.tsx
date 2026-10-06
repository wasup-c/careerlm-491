import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PortfolioPage from "./page";

describe("PortfolioPage", () => {
  it("shows completed roadmap work", () => {
    render(<PortfolioPage />);

    expect(
      screen.getByRole("heading", {
        name: /your completed work/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Strengthen HTML and CSS fundamentals"),
    ).toBeInTheDocument();
  });

  it("does not present incomplete roadmap work as completed", () => {
    render(<PortfolioPage />);

    expect(
      screen.queryByText(
        "Build confidence with JavaScript and TypeScript",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        "Create projects with React and Next.js",
      ),
    ).not.toBeInTheDocument();
  });

  it("provides a path back to the roadmap", () => {
    render(<PortfolioPage />);

    const link = screen.getByRole("link", {
      name: /back to roadmap/i,
    });

    expect(link).toHaveAttribute("href", "/roadmap");
  });
});