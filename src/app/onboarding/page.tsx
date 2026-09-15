'use client';
import React from "react";
import questionList from "@/app/questions/question_list";
import { useState } from "react";
import QuestionsList from "@/components/questionList";

export default function OnboardingPage() {

  return (
    <main className="bg-teal-100">
      <QuestionsList />
    </main>
  );
}