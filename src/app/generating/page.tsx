"use client";

import {
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";

import ErrorState from "@/components/ErrorState";
import {
  ONBOARDING_STORAGE_KEY,
  isValidOnboardingAnswers,
} from "@/lib/onboardingSession";

type GenerationState =
  | "processing"
  | "failed";

const SERVER_SNAPSHOT = "__server__";

function subscribeToSessionStorage(
  callback: () => void,
) {
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

function getOnboardingSnapshot() {
  return (
    window.sessionStorage.getItem(
      ONBOARDING_STORAGE_KEY,
    ) ?? ""
  );
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function hasValidStoredAnswers(
  storedAnswers: string,
) {
  if (!storedAnswers) {
    return false;
  }

  try {
    const parsedAnswers: unknown =
      JSON.parse(storedAnswers);

    return isValidOnboardingAnswers(parsedAnswers);
  } catch {
    return false;
  }
}

export default function GeneratingPage() {
  const router = useRouter();

  const [generationState, setGenerationState] =
    useState<GenerationState>("processing");

  const storedAnswers = useSyncExternalStore(
    subscribeToSessionStorage,
    getOnboardingSnapshot,
    getServerSnapshot,
  );

  const isChecking =
    storedAnswers === SERVER_SNAPSHOT;

  const hasValidAnswers =
    !isChecking &&
    hasValidStoredAnswers(storedAnswers);

  function handleRetry() {
    setGenerationState("processing");
  }

  function handleReturnToQuestionnaire() {
    router.push("/onboarding");
  }

  function simulateFailure() {
    setGenerationState("failed");
  }

  function simulateSuccess() {
    router.push("/roadmap");
  }

  if (isChecking) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />

          <h1 className="mt-6 text-3xl font-bold">
            Preparing Generation
          </h1>

          <p className="mt-4 text-gray-600">
            CareerLM is checking your questionnaire
            responses.
          </p>
        </div>
      </main>
    );
  }

  if (!hasValidAnswers) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <ErrorState
          title="Unable to Start Roadmap Generation"
          message="Your questionnaire responses are missing or invalid. Please complete the questionnaire before generating a roadmap."
          onNavigate={handleReturnToQuestionnaire}
          navigationLabel="Return to Questionnaire"
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      {generationState === "processing" && (
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />

          <h1 className="mt-6 text-3xl font-bold">
            Generating Your Roadmap
          </h1>

          <p className="mt-4 text-gray-600">
            CareerLM is preparing your personalized
            roadmap.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={simulateSuccess}
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              Simulate Success
            </button>

            <button
              type="button"
              onClick={simulateFailure}
              className="rounded border px-4 py-2"
            >
              Simulate Failure
            </button>
          </div>
        </div>
      )}

      {generationState === "failed" && (
        <ErrorState
          title="Unable to Generate Roadmap"
          message="Something went wrong while creating your roadmap."
          onRetry={handleRetry}
        />
      )}
    </main>
  );
}