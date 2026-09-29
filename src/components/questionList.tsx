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
