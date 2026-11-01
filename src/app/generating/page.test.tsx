import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { mockRoadmap } from "@/lib/mockRoadmap";

import GeneratingPage from "./page";

const push = vi.fn();

const GENERATED_ROADMAP_STORAGE_KEY =
  "careerlm-generated-roadmap";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

describe("GeneratingPage", () => {
  beforeEach(() => {
    push.mockClear();
    window.sessionStorage.clear();

    window.sessionStorage.setItem(
      GENERATED_ROADMAP_STORAGE_KEY,
      JSON.stringify(mockRoadmap),
    );
  });

  it("shows the processing state when a generated roadmap is available", () => {
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

  it("shows a recovery state when the generated roadmap handoff is missing", () => {
    window.sessionStorage.clear();

    render(<GeneratingPage />);

    expect(
      screen.getByRole("heading", {
        name: "Unable to Continue Roadmap Generation",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Return to Questionnaire",
      }),
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

  it("recovers safely from malformed generated-roadmap data", async () => {
    const user = userEvent.setup();

    window.sessionStorage.setItem(
      GENERATED_ROADMAP_STORAGE_KEY,
      "{invalid-json",
    );

    render(<GeneratingPage />);

    expect(
      screen.getByRole("heading", {
        name: "Unable to Continue Roadmap Generation",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Simulate Success",
      }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Return to Questionnaire",
      }),
    );

    expect(push).toHaveBeenCalledWith("/onboarding");
  });
});