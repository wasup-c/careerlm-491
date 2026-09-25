import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ErrorState from "./ErrorState";

describe("ErrorState", () => {
  it("renders the provided title and message", () => {
    render(
      <ErrorState
        title="Unable to Generate Roadmap"
        message="Something went wrong while creating your roadmap."
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Unable to Generate Roadmap",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Something went wrong while creating your roadmap.",
      ),
    ).toBeInTheDocument();
  });

  it("calls the retry handler when Try Again is selected", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <ErrorState
        title="Unable to Generate Roadmap"
        message="Something went wrong while creating your roadmap."
        onRetry={onRetry}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Try Again",
      }),
    );

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not display Try Again when no retry handler is provided", () => {
    render(
      <ErrorState
        title="Unable to Generate Roadmap"
        message="Something went wrong while creating your roadmap."
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: "Try Again",
      }),
    ).not.toBeInTheDocument();
  });
});