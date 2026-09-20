import MilestoneCard from "@/components/MilestoneCard";
import { mockRoadmap } from "@/data/mockRoadmap";

export default function RoadmapPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          Your CareerLM Roadmap
        </h1>

        <p className="mt-2 text-lg">
          Target Career: {mockRoadmap.targetRole}
        </p>

        <p className="mt-2">
          Overall Progress: {mockRoadmap.progressPercentage ?? 0}%
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">
          Career Milestones
        </h2>

        {mockRoadmap.milestones.map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
          />
        ))}
      </section>
    </main>
  );
}
