"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import questionListData from "@/app/questions/question_list";

type QuestionType =
  | "text"
  | "multiple-choice-ordered"
  | "multiple-choice-unordered";

type ResponseOption = {
  text: string;
};

type Question = {
  id: number;
  type: QuestionType;
  text: string;
  responses?: ResponseOption[];
};

type AnswerValue = string | string[];

type Answers = Record<number, AnswerValue>;

type Errors = Record<number, string>;

const questions = questionListData as Question[];

export default function QuestionsList() {
  const router = useRouter();

  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");

  function clearQuestionError(questionId: number) {
    setErrors((previous) => {
      const nextErrors = { ...previous };
      delete nextErrors[questionId];
      return nextErrors;
    });

    setSubmitError("");
  }

  function handleTextChange(questionId: number, value: string) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));

    clearQuestionError(questionId);
  }

  function handleSingleChoiceChange(
    questionId: number,
    response: string
  ) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: response,
    }));

    clearQuestionError(questionId);
  }

  function handleMultiChoiceChange(
    questionId: number,
    response: string,
    checked: boolean
  ) {
    setAnswers((previous) => {
      const existingValue = previous[questionId];

      const currentResponses = Array.isArray(existingValue)
        ? existingValue
        : [];

      const updatedResponses = checked
        ? Array.from(new Set([...currentResponses, response]))
        : currentResponses.filter(
            (currentResponse) => currentResponse !== response
          );

      return {
        ...previous,
        [questionId]: updatedResponses,
      };
    });

    clearQuestionError(questionId);
  }

  function validateAll(): boolean {
    const newErrors: Errors = {};

    questions.forEach((question) => {
      const value = answers[question.id];

      if (question.type === "text") {
        if (
          typeof value !== "string" ||
          value.trim().length === 0
        ) {
          newErrors[question.id] =
            "Please enter a response.";
        }
      }

      if (question.type === "multiple-choice-ordered") {
        if (
          typeof value !== "string" ||
          value.trim().length === 0
        ) {
          newErrors[question.id] =
            "Please select one option.";
        }
      }

      if (question.type === "multiple-choice-unordered") {
        if (!Array.isArray(value) || value.length === 0) {
          newErrors[question.id] =
            "Please select at least one option.";
        }
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSubmitError(
        "Please answer all required questions before continuing."
      );

      return false;
    }

    setSubmitError("");

    return true;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateAll()) {
      return;
    }

    /*
     * Temporary integration behavior.
     *
     * Sprint 2 persistence should eventually replace this temporary
     * browser storage with the CareerLM repository/service layer.
     */
    sessionStorage.setItem(
      "careerlm-onboarding-answers",
      JSON.stringify(answers)
    );

    router.push("/generating");
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-8">
        {questions.map((question) => {
          const answer = answers[question.id];
          const questionError = errors[question.id];

          return (
            <fieldset
              key={question.id}
              className="rounded-lg border border-slate-200 p-5"
            >
              <legend className="px-2 text-lg font-semibold text-slate-900">
                {question.id}. {question.text}
              </legend>

              {question.type === "text" && (
                <div className="mt-4">
                  <label
                    htmlFor={`question-${question.id}`}
                    className="sr-only"
                  >
                    {question.text}
                  </label>

                  <input
                    id={`question-${question.id}`}
                    type="text"
                    value={
                      typeof answer === "string"
                        ? answer
                        : ""
                    }
                    onChange={(event) =>
                      handleTextChange(
                        question.id,
                        event.target.value
                      )
                    }
                    aria-invalid={Boolean(questionError)}
                    aria-describedby={
                      questionError
                        ? `question-${question.id}-error`
                        : undefined
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                    placeholder="Enter your response"
                  />
                </div>
              )}

              {question.type ===
                "multiple-choice-ordered" && (
                <div className="mt-4 space-y-3">
                  {(question.responses ?? []).map(
                    (response) => (
                      <label
                        key={response.text}
                        className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-3 transition hover:bg-slate-50"
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={response.text}
                          checked={
                            answer === response.text
                          }
                          onChange={() =>
                            handleSingleChoiceChange(
                              question.id,
                              response.text
                            )
                          }
                          className="mt-1"
                        />

                        <span className="text-slate-700">
                          {response.text}
                        </span>
                      </label>
                    )
                  )}
                </div>
              )}

              {question.type ===
                "multiple-choice-unordered" && (
                <div className="mt-4 space-y-3">
                  {(question.responses ?? []).map(
                    (response) => {
                      const isChecked =
                        Array.isArray(answer) &&
                        answer.includes(response.text);

                      return (
                        <label
                          key={response.text}
                          className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-3 transition hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            name={`question-${question.id}`}
                            value={response.text}
                            checked={isChecked}
                            onChange={(event) =>
                              handleMultiChoiceChange(
                                question.id,
                                response.text,
                                event.target.checked
                              )
                            }
                            className="mt-1"
                          />

                          <span className="text-slate-700">
                            {response.text}
                          </span>
                        </label>
                      );
                    }
                  )}
                </div>
              )}

              {questionError && (
                <p
                  id={`question-${question.id}-error`}
                  role="alert"
                  className="mt-3 text-sm font-medium text-red-700"
                >
                  {questionError}
                </p>
              )}
            </fieldset>
          );
        })}
      </div>

      {submitError && (
        <div
          role="alert"
          className="mt-6 rounded-md border border-red-300 bg-red-50 p-4 text-red-800"
        >
          {submitError}
        </div>
      )}

      <div className="mt-8 flex justify-end border-t border-slate-200 pt-6">
        <button
          type="submit"
          className="rounded-md bg-teal-700 px-6 py-3 font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Generate My Roadmap
        </button>
      </div>
    </form>
  );
}