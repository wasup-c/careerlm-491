import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NavBar, { NAV_LINKS } from "./NavBar";

const mockPathname = vi.fn(() => "/dashboard");
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

describe("NavBar", () => {
  it("links the CareerLM logo back to the landing page", () => {
    render(<NavBar />);
    expect(screen.getByRole("link", { name: "CareerLM" })).toHaveAttribute("href", "/");
  });

  it("links to every main page", () => {
    render(<NavBar />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    for (const { href, label } of NAV_LINKS) {
      expect(
        nav.querySelector(`a[href="${href}"]`),
        `${label} link`,
      ).toHaveTextContent(label);
    }
  });

  it("marks only the current page with aria-current", () => {
    mockPathname.mockReturnValue("/roadmap");
    render(<NavBar />);
    expect(screen.getByRole("link", { name: "Roadmap" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });
});
