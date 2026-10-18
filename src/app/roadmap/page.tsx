import Link from "next/link";

import MilestoneCard from "@/components/MilestoneCard";
import SharedLayout from "@/components/SharedLayout";

import {
  getRoadmapProgress,
} from "@/lib/roadmapProgress";

import {
  careerDataService,
} from "@/lib/services/default-career-data-service";

/**
 * The roadmap is backed by user-specific server-side persistence.
 *
 * Prevent Next.js from treating the page as static build-time content so
 * each request can resolve the current user's latest persisted roadmap.
 */
export const dynamic =
  "force-dynamic";

export default async function RoadmapPage() {
  const roadmap =
    await careerDataService
      .getMyRoadmap();

  if (!roadmap) {
    return (
      <SharedLayout>
        <section className="mx-auto w-full max-w-3xl">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              CareerLM Roadmap
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              No roadmap yet
            </h1>

            <p className="mt-3 text-slate-600">
              Complete CareerLM onboarding to generate and save your
              personalized career roadmap.
            </p>

            <div className="mt-6">
              <Link
                href="/onboarding"
                className="inline-flex rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700"
              >
                Start onboarding
              </Link>
            </div>
          </div>
        </section>
      </SharedLayout>
    );
  }

  /**
   * Member 4 remains responsible for roadmap progress semantics.
   *
   * This page only changes where roadmap data comes from:
   * persisted current-user state rather than mockRoadmap.
   */
  const {
    progressPercentage,
  } =
    getRoadmapProgress(
      roadmap.milestones
    );

  const orderedMilestones = [
    ...roadmap.milestones,
  ].sort(
    (left, right) =>
      left.order -
      right.order
  );

  return (
    <SharedLayout>
      <section className="mx-auto w-full max-w-3xl">
        <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            CareerLM Roadmap
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Your path to{" "}
            {roadmap.targetRole}
          </h1>

          <p className="mt-3 text-slate-600">
            Follow these milestones in order and use each step to
            build toward your target role.
          </p>

          <p className="mt-3 text-sm text-slate-600">
            Estimated roadmap length:{" "}
            <span className="font-semibold text-slate-900">
              {roadmap.estimatedWeeks}{" "}
              weeks
            </span>
          </p>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-slate-900">
                Overall progress
              </span>

              <span className="text-slate-600">
                {progressPercentage}%
              </span>
            </div>

            <div
              className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-label="Roadmap progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={
                progressPercentage
              }
            >
              <div
                className="h-full rounded-full bg-teal-600"
                style={{
                  width:
                    `${progressPercentage}%`,
                }}
              />
            </div>
          </div>
        </header>

        <div className="mt-8 space-y-6">
          {orderedMilestones.map(
            (milestone) => (
              <MilestoneCard
                key={milestone.id}
                milestone={
                  milestone
                }
                position={
                  milestone.order
                }
              />
            )
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href="/portfolio"
            className="rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700"
          >
            View portfolio
          </Link>
        </div>
      </section>
    </SharedLayout>
  );
}