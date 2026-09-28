import type {
  MilestoneStatus,
  RoadmapMilestone,
} from "@/types/career";

interface MilestoneCardProps {
  milestone: RoadmapMilestone;
  position: number;
}

const statusLabels: Record<MilestoneStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed",
};

const statusClasses: Record<MilestoneStatus, string> = {
  "not-started": "bg-slate-100 text-slate-700",
  "in-progress": "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
};

export default function MilestoneCard({
  milestone,
  position,
}: MilestoneCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Milestone {position}
          </p>

          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            {milestone.title}
          </h2>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
            statusClasses[milestone.status]
          }`}
        >
          {statusLabels[milestone.status]}
        </span>
      </div>

      <p className="mt-4 leading-7 text-slate-600">
        {milestone.description}
      </p>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-slate-900">
          Skills
        </h3>

        <ul
          className="mt-2 flex flex-wrap gap-2"
          aria-label="Milestone skills"
        >
          {milestone.skills.map((skill) => (
            <li
              key={skill}
              className="rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-800"
            >
              {skill}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">
          Estimated time:
        </span>{" "}
        {milestone.estimatedTime}
      </p>

      {milestone.additionalInfo && (
        <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          {milestone.additionalInfo}
        </p>
      )}
    </article>
  );
}
