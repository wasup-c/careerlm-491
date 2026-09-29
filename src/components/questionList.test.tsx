import {
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const fetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.stubGlobal("fetch", fetchMock);

import QuestionsList from "./questionList";

const SUBMIT_BUTTON_NAME = /generate my roadmap/i;

function getQuestionGroup(name: RegExp) {
  return screen.getByRole("group", { name });
}

async function answerEveryQuestion(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.type(
    within(getQuestionGroup(/^1\./)).getByRole("textbox"),
    "Frontend Engineer",
  );

  await user.click(
    within(getQuestionGroup(/^2\./)).getByRole("radio", {
      name: /intermediate/i,
    }),
  );

  await user.click(
    within(getQuestionGroup(/^3\./)).getByRole("radio", {
      name: "5-10 hours",
    }),
  );

  await user.click(
    within(getQuestionGroup(/^4\./)).getByRole("radio", {
      name: "3-6 months",
    }),
  );

  await user.click(
    within(getQuestionGroup(/^5\./)).getByRole("checkbox", {
      name: /hands-on projects/i,
    }),
  );
}

describe("QuestionsList", () => {
  beforeEach(() => {
    pushMock.mockClear();
    fetchMock.mockReset();
    window.sessionStorage.clear();
  });

  it("renders every onboarding question as an accessible group", () => {
    render(<QuestionsList />);

    expect(
      getQuestionGroup(/^1\..*career role/i),
    ).toBeInTheDocument();

    expect(
      getQuestionGroup(/^2\..*experience level/i),
    ).toBeInTheDocument();

    expect(
      getQuestionGroup(/^3\..*hours per week/i),
    ).toBeInTheDocument();

    expect(
      getQuestionGroup(/^4\..*target timeline/i),
    ).toBeInTheDocument();

    expect(
      getQuestionGroup(/^5\..*most important in your learning/i),
    ).toBeInTheDocument();
  });

  it("shows a validation error for every unanswered question plus a page-level error, and does not navigate", async () => {
    const user = userEvent.setup();

    render(<QuestionsList />);

    await user.click(
      screen.getByRole("button", {
        name: SUBMIT_BUTTON_NAME,
      }),
    );

    // 5 field errors + 1 page-level error
    expect(screen.getAllByRole("alert")).toHaveLength(6);

    expect(
      screen.getByText(
        /please answer all required questions before continuing/i,
      ),
    ).toBeInTheDocument();

    expect(pushMock).not.toHaveBeenCalled();

    // Local validation should prevent the API request.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("clears a question's error as soon as it receives a valid answer", async () => {
    const user = userEvent.setup();

    render(<QuestionsList />);

    await user.click(
      screen.getByRole("button", {
        name: SUBMIT_BUTTON_NAME,
      }),
    );

    const textGroup = getQuestionGroup(/^1\./);

    expect(
      within(textGroup).getByRole("alert"),
    ).toHaveTextContent(/please enter a response/i);

    await user.type(
      within(textGroup).getByRole("textbox"),
      "Data Analyst",
    );

    expect(
      within(textGroup).queryByRole("alert"),
    ).not.toBeInTheDocument();
  });

  it("preserves previously entered values after a failed submission", async () => {
    const user = userEvent.setup();

    render(<QuestionsList />);

    const textInput = within(
      getQuestionGroup(/^1\./),
    ).getByRole("textbox");

    await user.type(textInput, "Data Analyst");

    // Questions 2-5 are unanswered, so local validation fails.
    await user.click(
      screen.getByRole("button", {
        name: SUBMIT_BUTTON_NAME,
      }),
    );

    expect(pushMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();

    expect(textInput).toHaveValue("Data Analyst");
  });

  it("submits the questionnaire to the roadmap API, stores the generated roadmap, and navigates after success", async () => {
    const user = userEvent.setup();

    const mockRoadmap = {
      title: "Frontend Engineer Roadmap",
      milestones: [
        {
          id: 1,
          title: "Learn React fundamentals",
        },
      ],
    };

    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        roadmap: mockRoadmap,
      }),
    });

    render(<QuestionsList />);

    await answerEveryQuestion(user);

    await user.click(
      screen.getByRole("button", {
        name: SUBMIT_BUTTON_NAME,
      }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/roadmap",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetCareerRole: "Frontend Engineer",
          experienceLevel:
            "Intermediate (some coursework/projects)",
          weeklyTimeCommitment: "5-10 hours",
          targetTimeline: "3-6 months",
          preferredLearningStyle: [
            "Hands-on projects",
          ],
        }),
      },
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        "/generating",
      );
    });

    expect(
      screen.queryAllByRole("alert"),
    ).toHaveLength(0);

    const storedRoadmap = JSON.parse(
      window.sessionStorage.getItem(
        "careerlm-generated-roadmap",
      ) ?? "{}",
    );

    expect(storedRoadmap).toEqual(mockRoadmap);
  });

  it("allows the submit button to be activated with the keyboard", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        roadmap: {
          title: "Frontend Engineer Roadmap",
        },
      }),
    });

    render(<QuestionsList />);

    await answerEveryQuestion(user);

    const submitButton = screen.getByRole(
      "button",
      {
        name: SUBMIT_BUTTON_NAME,
      },
    );

    submitButton.focus();

    expect(submitButton).toHaveFocus();

    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        "/generating",
      );
    });
  });

  it("displays a field-level error returned by the server and does not navigate", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Questionnaire validation failed.",
          fieldErrors: {
            targetCareerRole:
              "Target career role is required.",
          },
        },
      }),
    });

    render(<QuestionsList />);

    await answerEveryQuestion(user);

    await user.click(
      screen.getByRole("button", {
        name: SUBMIT_BUTTON_NAME,
      }),
    );

    await waitFor(() => {
      expect(
        within(getQuestionGroup(/^1\./)).getByRole("alert"),
      ).toHaveTextContent(
        /target career role is required/i,
      );
    });

    expect(
      screen.getByText(
        /please fix the highlighted questions before continuing/i,
      ),
    ).toBeInTheDocument();

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows a general error message when roadmap generation fails on the server", async () => {
    const user = userEvent.setup();

    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        success: false,
        error: {
          code: "GENERATION_FAILED",
          message: "Roadmap generation failed.",
        },
      }),
    });

    render(<QuestionsList />);

    await answerEveryQuestion(user);

    await user.click(
      screen.getByRole("button", {
        name: SUBMIT_BUTTON_NAME,
      }),
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /roadmap generation failed/i,
      );
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows a connection error and does not navigate when the network request fails", async () => {
    const user = userEvent.setup();

    fetchMock.mockRejectedValueOnce(
      new Error("Network request failed"),
    );

    render(<QuestionsList />);

    await answerEveryQuestion(user);

    await user.click(
      screen.getByRole("button", {
        name: SUBMIT_BUTTON_NAME,
      }),
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /unable to reach careerlm/i,
      );
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("prevents duplicate submissions while a request is in flight", async () => {
    const user = userEvent.setup();

    let resolvePendingRequest!: (value: {
      json: () => Promise<unknown>;
    }) => void;

    const pendingResponse = new Promise<{
      json: () => Promise<unknown>;
    }>((resolve) => {
      resolvePendingRequest = resolve;
    });

    fetchMock.mockReturnValueOnce(pendingResponse);

    render(<QuestionsList />);

    await answerEveryQuestion(user);

    const submitButton = screen.getByRole("button", {
      name: SUBMIT_BUTTON_NAME,
    });

    await user.click(submitButton);

    // While the request is pending, the button must be disabled
    // so a second click cannot fire a duplicate request.
    expect(submitButton).toBeDisabled();

    await user.click(submitButton);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolvePendingRequest({
      json: async () => ({
        success: true,
        roadmap: { title: "Frontend Engineer Roadmap" },
      }),
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/generating");
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
