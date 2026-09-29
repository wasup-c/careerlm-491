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

/**
 * Maps the API's questionnaire field names back to the numeric
 * question IDs used in this component's local state, so server-side
 * field errors can be displayed next to the right question.
 */
const FIELD_NAME_TO_QUESTION_ID: Record<string, number> = {
  targetCareerRole: 1,
  experienceLevel: 2,
  weeklyTimeCommitment: 3,
  targetTimeline: 4,
  preferredLearningStyle: 5,
};

type RoadmapApiResponse =
  | {
      success: true;
      roadmap: unknown;
    }
  | {
      success: false;
      error: {
        code: "VALIDATION_ERROR" | "GENERATION_FAILED";
        message: string;
        fieldErrors?: Record<string, string>;
      };
    };

export default function QuestionsList() {
  const router = useRouter();

  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  /**
   * Builds the request body expected by POST /api/roadmap.
   * Assumes validateAll() has already confirmed every question has
   * an answer of the expected shape.
   */
  function buildQuestionnairePayload() {
    return {
      targetCareerRole: answers[1] as string,
      experienceLevel: answers[2] as string,
      weeklyTimeCommitment: answers[3] as string,
      targetTimeline: answers[4] as string,
      preferredLearningStyle: answers[5] as string[],
    };
  }

  /**
   * Applies field-level validation errors returned by the server onto
   * the matching question, using FIELD_NAME_TO_QUESTION_ID to translate
   * between the API's field names and this component's question IDs.
   */
  function applyServerFieldErrors(
    fieldErrors: Record<string, string>
  ) {
    const mappedErrors: Errors = {};

    Object.entries(fieldErrors).forEach(([fieldName, message]) => {
      const questionId = FIELD_NAME_TO_QUESTION_ID[fieldName];

      if (questionId !== undefined) {
        mappedErrors[questionId] = message;
      }
    });

    setErrors(mappedErrors);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Prevent duplicate submissions while a request is already in flight.
    if (isSubmitting) {
      return;
    }

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildQuestionnairePayload()),
      });

      const body: RoadmapApiResponse = await response.json();

      if (body.success) {
        /*
         * Temporary integration behavior.
         *
         * The generated roadmap will eventually be handed off through
         * Member 5's save/reload/retake workflow. Until that hand-off
         * is agreed, the roadmap is kept in sessionStorage so the
         * /generating destination can read it.
         */
        sessionStorage.setItem(
          "careerlm-generated-roadmap",
          JSON.stringify(body.roadmap)
        );

        router.push("/generating");
        return;
      }

      if (body.error.code === "VALIDATION_ERROR" && body.error.fieldErrors) {
        applyServerFieldErrors(body.error.fieldErrors);
        setSubmitError(
          "Please fix the highlighted questions before continuing."
        );
        return;
      }

      // GENERATION_FAILED, or a VALIDATION_ERROR with no field detail.
      setSubmitError(
        body.error.message ||
          "Something went wrong while generating your roadmap. Please try again."
      );
    } catch {
      // Network failure, timeout, or a response that wasn't valid JSON.
      setSubmitError(
        "Unable to reach CareerLM right now. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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
                    disabled={isSubmitting}
                    aria-invalid={Boolean(questionError)}
                    aria-describedby={
                      questionError
                        ? `question-${question.id}-error`
                        : undefined
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                          disabled={isSubmitting}
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
                            disabled={isSubmitting}
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
          disabled={isSubmitting}
          className="rounded-md bg-teal-700 px-6 py-3 font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-teal-400"
        >
          {isSubmitting ? "Generating..." : "Generate My Roadmap"}
        </button>
      </div>
    </form>
  );
}
