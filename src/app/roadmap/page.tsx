import MilestoneCard from "@/components/MilestoneCard";
<<<<<<< HEAD
import { mockRoadmap } from "@/data/mockRoadmap";

function calculateProgress(): number {
  if (mockRoadmap.milestones.length === 0) {
    return 0;
  }

  const completedMilestones =
    mockRoadmap.milestones.filter(
      (milestone) =>
        milestone.status === "completed"
    ).length;

  return Math.round(
    (completedMilestones /
      mockRoadmap.milestones.length) *
      100
  );
}

export default function RoadmapPage() {
  const progressPercentage =
    calculateProgress();

  return (
    <main className="min-h-screen bg-teal-50 px-4 py-10">
      <section className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            CareerLM Career Roadmap
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            {mockRoadmap.title}
          </h1>

          <p className="mt-4 text-lg text-slate-700">
            Target Career:{" "}
            <span className="font-semibold">
              {mockRoadmap.targetRole}
            </span>
          </p>

          <p className="mt-2 text-slate-600">
            Estimated completion time:{" "}
            <span className="font-medium">
              {mockRoadmap.estimatedWeeks} weeks
            </span>
          </p>

          <div className="mt-6">
            <div className="mb-2 flex justify-between gap-4">
              <span className="font-medium text-slate-700">
                Overall Progress
              </span>

              <span className="font-semibold text-teal-700">
                {progressPercentage}%
=======
import SharedLayout from "@/components/SharedLayout";
import { mockRoadmap } from "@/lib/mockRoadmap";

export default function RoadmapPage() {
  return (
    <SharedLayout>
      <section className="mx-auto w-full max-w-3xl">
        <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            CareerLM Roadmap
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Your path to {mockRoadmap.targetRole}
          </h1>

          <p className="mt-3 text-slate-600">
            Follow these milestones in order and use each step
            to build toward your target role.
          </p>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-slate-900">
                Overall progress
              </span>

              <span className="text-slate-600">
                {mockRoadmap.progressPercentage ?? 0}%
>>>>>>> 22c3181449c5ed915be6454f6f1212059d3306cc
              </span>
            </div>

            <div
<<<<<<< HEAD
              className="h-3 overflow-hidden rounded-full bg-slate-200"
=======
              className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200"
>>>>>>> 22c3181449c5ed915be6454f6f1212059d3306cc
              role="progressbar"
              aria-label="Roadmap progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={
<<<<<<< HEAD
                progressPercentage
              }
            >
              <div
                className="h-full bg-teal-700 transition-all"
                style={{
                  width: `${progressPercentage}%`,
=======
                mockRoadmap.progressPercentage ?? 0
              }
            >
              <div
                className="h-full rounded-full bg-teal-600"
                style={{
                  width: `${
                    mockRoadmap.progressPercentage ?? 0
                  }%`,
>>>>>>> 22c3181449c5ed915be6454f6f1212059d3306cc
                }}
              />
            </div>
          </div>
        </header>

<<<<<<< HEAD
        <section aria-labelledby="milestones-heading">
          <h2
            id="milestones-heading"
            className="mb-6 text-2xl font-semibold text-slate-900"
          >
            Career Milestones
          </h2>

          <div className="space-y-6">
            {mockRoadmap.milestones
              .toSorted(
                (a, b) => a.order - b.order
              )
              .map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                />
              ))}
          </div>
        </section>

        <p className="mt-8 text-center text-sm text-slate-500">
          Sprint 1 demonstration using mock
          CareerLM roadmap data.
        </p>
      </section>
    </main>
=======
        <div className="mt-8 space-y-6">
          {mockRoadmap.milestones.map(
            (milestone, index) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                position={index + 1}
              />
            )
          )}
        </div>
      </section>
    </SharedLayout>
>>>>>>> 22c3181449c5ed915be6454f6f1212059d3306cc
  );
}
