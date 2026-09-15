'use client';
import React from "react";
import questionList from "@/app/questions/question_list";
import { useState } from "react";

export default function OnboardingPage() {
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});

  function handleTextChange(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleSingleChoiceChange(questionId, response) {
    setAnswers((prev) => ({ ...prev, [questionId]: response }));
  }

  function handleMultiChoiceChange(questionId, response, checked) {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const updated = checked
        ? [...current, response]
        : current.filter((r) => r !== response);
      return { ...prev, [questionId]: updated };
    });
  }

  function validateAll() {
    const newErrors = {};

    questionList.forEach((question) => {
      const value = answers[question.id];

      if (question.type === "text") {
        if (!value || value.trim() === "") {
          newErrors[question.id] = "Please enter a response.";
        }
      } else if (question.type === "multiple-choice") {
        if (question.multiple) {
          if (!value || value.length === 0) {
            newErrors[question.id] = "Please select at least one option.";
          }
        } else {
          if (!value) {
            newErrors[question.id] = "Please select an option.";
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  function handleSubmit() {
    const isValid = validateAll();
    if (isValid) {
      console.log("All answers valid:", answers);
      // navigate / submit here
    }
  }

  return (
    <main className="bg-teal-100">
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold mb-4 text-blue-950">Let's Get Started!</h1>
        <div className="w-full max-w-xl">
          {questionList.map((question) => (
            <div key={question.id} className="mb-4">
              <p className="text-lg text-blue-950 font-bold">
                {question.id}. {question.text}
              </p>

              {question.type === "text" && (
                <input
                  type="text"
                  value={answers[question.id] || ""}
                  onChange={(e) => handleTextChange(question.id, e.target.value)}
                  className="border border-gray-300 bg-white rounded-md p-2 w-full"
                />
              )}

              {question.type === "multiple-choice" && !question.multiple && (
                <ul className="pl-5">
                  {question.responses.map((response, i) => (
                    <li key={i} className="mb-1 list-none">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          checked={answers[question.id] === response}
                          onChange={() => handleSingleChoiceChange(question.id, response)}
                          className="mr-2"
                        />
                        {response}
                      </label>
                    </li>
                  ))}
                </ul>
              )}

              {question.type === "multiple-choice" && question.multiple && (
                <ul className="pl-5">
                  {question.responses.map((response, i) => (
                    <li key={i} className="mb-1 list-none">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name={`question-${question.id}`}
                          checked={(answers[question.id] || []).includes(response)}
                          onChange={(e) =>
                            handleMultiChoiceChange(question.id, response, e.target.checked)
                          }
                          className="mr-2"
                        />
                        {response}
                      </label>
                    </li>
                  ))}
                </ul>
              )}

              {errors[question.id] && (
                <p className="text-red-600 text-sm mt-1">{errors[question.id]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center pb-8">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Get Started!
        </button>
      </div>
    </main>
  );
}