"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ErrorState from "@/components/ErrorState";

type GenerationState = "processing" | "failed";

export default function GeneratingPage() {
  const [status, setStatus] = useState<GenerationState>("processing");
  const router = useRouter();

  function handleRetry() {
    setStatus("processing");
  }

  function simulateFailure() {
    setStatus("failed");
  }

  function simulateSuccess() {
    router.push("/roadmap");
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      {status === "processing" && (
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />

          <h1 className="mt-6 text-3xl font-bold">
            Generating Your Roadmap
          </h1>

          <p className="mt-4 text-gray-600">
            CareerLM is preparing your personalized roadmap.
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

      {status === "failed" && (
        <ErrorState
          title="Unable to Generate Roadmap"
          message="Something went wrong while creating your roadmap."
          onRetry={handleRetry}
        />
      )}
    </main>
  );
}