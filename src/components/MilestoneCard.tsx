import type { RoadmapMilestone } from "@/types/career";

interface MilestoneCardProps {
  milestone: RoadmapMilestone;
}

function formatStatus(status: RoadmapMilestone["status"]) {
  switch (status) {
    case "completed":
      return "Completed";

    case "in-progress":
      return "In Progress";

    default:
      return "Not Started";
  }
}

export default function MilestoneCard({
  milestone,
}: MilestoneCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">
          {milestone.title}
        </h2>

        <p className="mt-2 text-slate-600">
          {milestone.description}
        </p>
      </div>

      <div className="mb-4">
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

      <div className="space-y-2 text-slate-700">
        <p>
          <span className="font-semibold">
            Estimated Time:
          </span>{" "}
          {milestone.estimatedTime}
        </p>

        <p>
          <span className="font-semibold">
            Status:
          </span>{" "}
          {formatStatus(milestone.status)}
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
