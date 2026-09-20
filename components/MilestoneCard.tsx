import type { RoadmapMilestone } from "@/types/career";

interface MilestoneCardProps {
  milestone: RoadmapMilestone;
}

export default function MilestoneCard({
  milestone,
}: MilestoneCardProps) {
  return (
    <article className="rounded-lg border p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          {milestone.title}
        </h2>

        <p className="mt-2 text-gray-600">
          {milestone.description}
        </p>
      </div>

      <div className="mb-4">
        <h3 className="font-medium">Skills</h3>

        <ul className="mt-2 flex flex-wrap gap-2">
          {milestone.skills.map((skill) => (
            <li
              key={skill}
              className="rounded-md border px-3 py-1 text-sm"
            >
              {skill}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <p>
          <span className="font-medium">Estimated Time:</span>{" "}
          {milestone.estimatedTime}
        </p>

        <p>
          <span className="font-medium">Status:</span>{" "}
          {milestone.status}
        </p>

        {milestone.additionalInfo && (
          <p className="text-sm text-gray-600">
            {milestone.additionalInfo}
          </p>
        )}
      </div>
    </article>
  );
}
