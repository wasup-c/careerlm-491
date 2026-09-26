import MilestoneCard from "@/components/MilestoneCard";
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
            Follow these milestones in order and use each step to build toward
            your target role.
          </p>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-slate-900">
                Overall progress
              </span>

              <span className="text-slate-600">
                {mockRoadmap.progressPercentage ?? 0}%
              </span>
            </div>

            <div
              className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-label="Roadmap progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={mockRoadmap.progressPercentage ?? 0}
            >
              <div
                className="h-full rounded-full bg-teal-600"
                style={{
                  width: `${mockRoadmap.progressPercentage ?? 0}%`,
                }}
              />
            </div>
          </div>
        </header>

        <div className="mt-8 space-y-6">
          {mockRoadmap.milestones.map((milestone, index) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              position={index + 1}
            />
          ))}
        </div>
      </section>
    </SharedLayout>
  );
}
