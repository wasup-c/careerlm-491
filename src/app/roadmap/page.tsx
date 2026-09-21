"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import MilestoneCard from "@/components/MilestoneCard";
import type { CareerRoadmap } from "@/types/career";

type RoadmapState = CareerRoadmap | null | undefined;

export default function RoadmapPage() {
  const router = useRouter();

  // undefined = still loading
  // null = no roadmap was found
  // CareerRoadmap = roadmap successfully loaded
  const [roadmap, setRoadmap] =
    useState<RoadmapState>(undefined);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const storedRoadmap = sessionStorage.getItem(
        "careerlm-roadmap"
      );

      if (!storedRoadmap) {
        setRoadmap(null);
        return;
      }

      try {
        const parsedRoadmap: CareerRoadmap =
          JSON.parse(storedRoadmap);

        setRoadmap(parsedRoadmap);
      } catch (error) {
        console.error(
          "Unable to load roadmap:",
          error
        );

        setRoadmap(null);
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  // Still loading the roadmap from sessionStorage.
  if (roadmap === undefined) {
    return (
      <main className="min-h-screen bg-teal-50 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-slate-600">
            Loading your roadmap...
          </p>
        </div>
      </main>
    );
  }

  // No roadmap exists in sessionStorage.
  if (roadmap === null) {
    return (
      <main className="min-h-screen bg-teal-50 px-4 py-10">
        <section className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
              No Roadmap Available
            </h1>

            <p className="mt-3 text-slate-600">
              Complete the CareerLM onboarding questionnaire
              to generate your career roadmap.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/onboarding")
              }
              className="mt-6 rounded-md bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800"
            >
              Start Onboarding
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-teal-50 px-4 py-10">
      <section className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            CareerLM Career Roadmap
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Your Career Roadmap
          </h1>

          <p className="mt-4 text-lg text-slate-700">
            Target Career:{" "}
            <span className="font-semibold">
              {roadmap.targetRole}
            </span>
          </p>

          <div className="mt-6">
            <div className="mb-2 flex justify-between">
              <span className="font-medium text-slate-700">
                Overall Progress
              </span>

              <span className="font-semibold text-teal-700">
                {roadmap.progressPercentage}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-teal-700 transition-all"
                style={{
                  width: `${roadmap.progressPercentage}%`,
                }}
              />
            </div>
          </div>
        </header>

        <section>
          <h2 className="mb-6 text-2xl font-semibold text-slate-900">
            Career Milestones
          </h2>

          <div className="space-y-6">
            {roadmap.milestones.map(
              (milestone, index) => (
                <div key={milestone.id}>
                  <p className="mb-2 text-sm font-semibold text-teal-700">
                    Milestone {index + 1}
                  </p>

                  <MilestoneCard
                    milestone={milestone}
                  />
                </div>
              )
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
