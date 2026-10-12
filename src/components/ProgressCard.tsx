import Link from "next/link";
import type { TemporaryRoadmapProgress } from "@/types/dashboard";

interface ProgressCardProps {
  /** null means the user has no roadmap yet. */
  progress: TemporaryRoadmapProgress | null;
}

/**
 * Presentation-only roadmap progress summary.
 *
 * It displays the values it is given. Calculating progress from a
 * roadmap is owned by Member 4; this component never recomputes it.
 */
export default function ProgressCard({ progress }: ProgressCardProps) {
  const hasRoadmap = progress !== null && progress.totalMilestones > 0;

  // Keep the bar inside 0–100 so unexpected input can't break the layout.
  const percent = hasRoadmap
    ? Math.min(100, Math.max(0, progress.percentComplete))
    : 0;

  return (
    <section
      aria-labelledby="progress-heading"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 id="progress-heading" className="text-lg font-semibold text-slate-900">
        Roadmap progress
      </h2>

      {hasRoadmap ? (
        <>
          <p className="mt-4 text-3xl font-bold text-slate-900">{percent}%</p>
          <p className="mt-1 text-slate-600">
            {progress.completedMilestones} of {progress.totalMilestones}{" "}
            milestones completed
          </p>

          <div
            role="progressbar"
            aria-label="Roadmap progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200"
          >
            <div
              className="h-full rounded-full bg-teal-600"
              style={{ width: `${percent}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-slate-600">
            You haven&rsquo;t generated a roadmap yet. Answer a few questions
            to get your personalized plan.
          </p>
          <Link
            href="/onboarding"
            className="mt-4 inline-flex items-center rounded-md bg-teal-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            Start onboarding
          </Link>
        </>
      )}
    </section>
  );
}
