import type {
  MilestoneStatus,
  RoadmapMilestone,
} from "@/types/career";

interface MilestoneCardProps {
  milestone: RoadmapMilestone;
}

function formatStatus(
  status: MilestoneStatus
): string {
  switch (status) {
    case "completed":
      return "Completed";

    case "in-progress":
      return "In Progress";

    case "not-started":
      return "Not Started";
  }
}

function getStatusClasses(
  status: MilestoneStatus
): string {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";

    case "in-progress":
      return "bg-amber-100 text-amber-800";

    case "not-started":
      return "bg-slate-100 text-slate-700";
  }
}

export default function MilestoneCard({
  milestone,
}: MilestoneCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Milestone {milestone.order}
          </p>

          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            {milestone.title}
          </h2>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(
            milestone.status
          )}`}
        >
          {formatStatus(milestone.status)}
        </span>
      </div>

      <p className="mt-4 text-slate-600">
        {milestone.description}
      </p>

      <div className="mt-5">
        <h3 className="font-semibold text-slate-900">
          Skills
        </h3>

        <ul className="mt-2 flex flex-wrap gap-2">
          {milestone.skills.map((skill) => (
            <li
              key={skill}
              className="rounded-md bg-teal-50 px-3 py-1 text-sm text-teal-800"
            >
              {skill}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 space-y-2 text-slate-700">
        <p>
          <span className="font-semibold">
            Estimated effort:
          </span>{" "}
          {milestone.estimatedHours} hours
        </p>

        {milestone.additionalInfo && (
          <p className="text-sm text-slate-600">
            {milestone.additionalInfo}
          </p>
        )}
      </div>
    </article>
  );
}
