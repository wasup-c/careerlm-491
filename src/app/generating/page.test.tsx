import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import GeneratingPage from "./page";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

describe("GeneratingPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("shows the processing state when generation begins", () => {
    render(<GeneratingPage />);

    expect(
      screen.getByRole("heading", {
        name: "Generating Your Roadmap",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "CareerLM is preparing your personalized roadmap.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the failure state when generation fails", async () => {
    const user = userEvent.setup();

    render(<GeneratingPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Simulate Failure",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Unable to Generate Roadmap",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Generating Your Roadmap",
      }),
    ).not.toBeInTheDocument();
  });

  it("returns to processing after retrying a failure", async () => {
    const user = userEvent.setup();

    render(<GeneratingPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Simulate Failure",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Try Again",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Generating Your Roadmap",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Unable to Generate Roadmap",
      }),
    ).not.toBeInTheDocument();
  });

  it("navigates to the roadmap after successful generation", async () => {
    const user = userEvent.setup();

    render(<GeneratingPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Simulate Success",
      }),
    );

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/roadmap");
  });
});