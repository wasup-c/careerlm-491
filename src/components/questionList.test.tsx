import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

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
    window.sessionStorage.clear();
  });

  it("renders every onboarding question as an accessible group", () => {
    render(<QuestionsList />);

    expect(getQuestionGroup(/^1\..*career role/i)).toBeInTheDocument();
    expect(getQuestionGroup(/^2\..*experience level/i)).toBeInTheDocument();
    expect(getQuestionGroup(/^3\..*hours per week/i)).toBeInTheDocument();
    expect(getQuestionGroup(/^4\..*target timeline/i)).toBeInTheDocument();
    expect(
      getQuestionGroup(/^5\..*most important in your learning/i),
    ).toBeInTheDocument();
  });

  it("shows a validation error for every unanswered question plus a page-level error, and does not navigate", async () => {
    const user = userEvent.setup();
    render(<QuestionsList />);

    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON_NAME }));

    // one alert per unanswered question (5) + one page-level alert
    expect(screen.getAllByRole("alert")).toHaveLength(6);
    expect(
      screen.getByText(
        /please answer all required questions before continuing/i,
      ),
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("clears a question's error as soon as it receives a valid answer", async () => {
    const user = userEvent.setup();
    render(<QuestionsList />);

    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON_NAME }));

    const textGroup = getQuestionGroup(/^1\./);
    expect(within(textGroup).getByRole("alert")).toHaveTextContent(
      /please enter a response/i,
    );

    await user.type(
      within(textGroup).getByRole("textbox"),
      "Data Analyst",
    );

    expect(within(textGroup).queryByRole("alert")).not.toBeInTheDocument();
  });

  it("preserves previously entered values after a failed submission", async () => {
    const user = userEvent.setup();
    render(<QuestionsList />);

    const textInput = within(getQuestionGroup(/^1\./)).getByRole("textbox");
    await user.type(textInput, "Data Analyst");

    // questions 2-5 are still unanswered, so this submission must fail
    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON_NAME }));

    expect(pushMock).not.toHaveBeenCalled();
    expect(textInput).toHaveValue("Data Analyst");
  });

  it("submits successfully, clears all errors, and stores the answers when every question is answered", async () => {
    const user = userEvent.setup();
    render(<QuestionsList />);

    await answerEveryQuestion(user);
    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON_NAME }));

    expect(screen.queryAllByRole("alert")).toHaveLength(0);
    expect(pushMock).toHaveBeenCalledWith("/generating");

    const stored = JSON.parse(
      window.sessionStorage.getItem("careerlm-onboarding-answers") ?? "{}",
    );

    expect(stored[1]).toBe("Frontend Engineer");
    expect(stored[2]).toBe("Intermediate (some coursework/projects)");
    expect(stored[5]).toEqual(["Hands-on projects"]);
  });

  it("can be submitted using only the keyboard once every question is answered", async () => {
    const user = userEvent.setup();
    render(<QuestionsList />);

    await answerEveryQuestion(user);

    const submitButton = screen.getByRole("button", {
      name: SUBMIT_BUTTON_NAME,
    });
    submitButton.focus();
    expect(submitButton).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(pushMock).toHaveBeenCalledWith("/generating");
  });
});
