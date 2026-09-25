import MilestoneCard from "@/components/MilestoneCard";
import { mockRoadmap } from "@/data/mockRoadmap";

export default function RoadmapPage() {
  const completedMilestones =
    mockRoadmap.milestones.filter(
      (milestone) =>
        milestone.status === "completed"
    ).length;

  const progressPercentage = Math.round(
    (completedMilestones /
      mockRoadmap.milestones.length) *
      100
  );

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
            Estimated timeline:{" "}
            {mockRoadmap.estimatedWeeks} weeks
          </p>

          <div className="mt-6">
            <div className="mb-2 flex justify-between">
              <span className="font-medium text-slate-700">
                Overall Progress
              </span>

              <span className="font-semibold text-teal-700">
                {progressPercentage}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-teal-700 transition-all"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
          </div>
        </header>

        <section
          aria-labelledby="career-milestones-heading"
        >
          <h2
            id="career-milestones-heading"
            className="mb-6 text-2xl font-semibold text-slate-900"
          >
            Career Milestones
          </h2>

          <div className="space-y-6">
            {mockRoadmap.milestones.map(
              (milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                />
              )
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
