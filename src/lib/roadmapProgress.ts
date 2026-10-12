
import type { RoadmapMilestone } from "@/types/career";

export interface RoadmapProgress {
  completedMilestones: number;
  totalMilestones: number;
  progressPercentage: number;
}

export function getRoadmapProgress(
  milestones: readonly RoadmapMilestone[]
): RoadmapProgress {
  const totalMilestones = milestones.length;

  const completedMilestones = milestones.filter(
    (milestone) => milestone.status === "completed"
  ).length;

  const progressPercentage =
    totalMilestones === 0
      ? 0
      : Math.round(
          (completedMilestones / totalMilestones) * 100
        );

  return {
    completedMilestones,
    totalMilestones,
    progressPercentage,
  };
}
