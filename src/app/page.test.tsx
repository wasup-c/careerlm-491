import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Landing page", () => {
  it("shows the CareerLM heading and tagline", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: "CareerLM" })).toBeInTheDocument();
    expect(screen.getByText(/career guidance made easy/i)).toBeInTheDocument();
  });

  it("sends the user to the navigation page", () => {
    render(<Home />);
    expect(screen.getByRole("link", { name: "Start your journey!" })).toHaveAttribute(
      "href",
      "/explore",
    );
  });
});
