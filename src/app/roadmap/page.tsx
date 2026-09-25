import MilestoneCard from "@/components/MilestoneCard";
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
              </span>
            </div>

            <div
              className="h-3 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-label="Roadmap progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={
                progressPercentage
              }
            >
              <div
                className="h-full bg-teal-700 transition-all"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
          </div>
        </header>

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
  );
}
