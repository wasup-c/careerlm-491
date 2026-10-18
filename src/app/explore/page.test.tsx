import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ExplorePage from "./page";

describe("Navigation page", () => {
  it("has a heading and a labeled navigation region", () => {
    render(<ExplorePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Where would you like to go?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "CareerLM sections" })).toBeInTheDocument();
  });

  it("links to every main CareerLM area", () => {
    render(<ExplorePage />);
    const nav = screen.getByRole("navigation", { name: "CareerLM sections" });
    const links = within(nav).getAllByRole("link");

    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/onboarding",
      "/dashboard",
      "/roadmap",
      "/portfolio",
    ]);
    expect(within(nav).getByRole("link", { name: /take the questionnaire/i })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
  });

  it("links back to the landing page", () => {
    render(<ExplorePage />);
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  });
});
