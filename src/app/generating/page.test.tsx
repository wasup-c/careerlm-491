import {
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import GeneratingPage from "./page";
import { ONBOARDING_STORAGE_KEY } from "@/lib/onboardingSession";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

const validAnswers = {
  1: "Frontend Developer",
  2: "Intermediate (some coursework/projects)",
  3: "5-10 hours",
  4: "3-6 months",
  5: [
    "Hands-on projects",
    "Structured curriculum",
  ],
};

function storeValidAnswers() {
  sessionStorage.setItem(
    ONBOARDING_STORAGE_KEY,
    JSON.stringify(validAnswers),
  );
}

describe("GeneratingPage", () => {
  beforeEach(() => {
    push.mockClear();
    sessionStorage.clear();
  });

  it("shows the processing state when valid onboarding answers exist", async () => {
    storeValidAnswers();

    render(<GeneratingPage />);

    expect(
      await screen.findByRole("heading", {
        name: "Generating Your Roadmap",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "CareerLM is preparing your personalized roadmap.",
      ),
    ).toBeInTheDocument();
  });

  it("shows an error when onboarding answers are missing", async () => {
    render(<GeneratingPage />);

    expect(
      await screen.findByRole("heading", {
        name: "Unable to Start Roadmap Generation",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Return to Questionnaire",
      }),
    ).toBeInTheDocument();
  });

  it("shows an error when stored onboarding data is malformed", async () => {
    sessionStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      "not-valid-json",
    );

    render(<GeneratingPage />);

    expect(
      await screen.findByRole("heading", {
        name: "Unable to Start Roadmap Generation",
      }),
    ).toBeInTheDocument();
  });

  it("shows an error when onboarding answers are incomplete", async () => {
    sessionStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({
        1: "Frontend Developer",
        2: "Beginner (little to no experience)",
      }),
    );

    render(<GeneratingPage />);

    expect(
      await screen.findByRole("heading", {
        name: "Unable to Start Roadmap Generation",
      }),
    ).toBeInTheDocument();
  });

  it("returns the user to onboarding from an invalid state", async () => {
    const user = userEvent.setup();

    render(<GeneratingPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "Return to Questionnaire",
      }),
    );

    expect(push).toHaveBeenCalledWith("/onboarding");
  });

  it("shows the generation failure state when generation fails", async () => {
    const user = userEvent.setup();

    storeValidAnswers();

    render(<GeneratingPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "Simulate Failure",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Unable to Generate Roadmap",
      }),
    ).toBeInTheDocument();
  });

  it("returns to processing after retrying a generation failure", async () => {
    const user = userEvent.setup();

    storeValidAnswers();

    render(<GeneratingPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "Simulate Failure",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Try Again",
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Generating Your Roadmap",
      }),
    ).toBeInTheDocument();
  });

  it("navigates to the roadmap after successful generation", async () => {
    const user = userEvent.setup();

    storeValidAnswers();

    render(<GeneratingPage />);

    await user.click(
      await screen.findByRole("button", {
        name: "Simulate Success",
      }),
    );

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/roadmap");
  });
});