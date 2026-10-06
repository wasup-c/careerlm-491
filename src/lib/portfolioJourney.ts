import type {
  CareerRoadmap,
  RoadmapMilestone,
} from "@/types/career";

export function getCompletedPortfolioWork(
  roadmap: CareerRoadmap,
): RoadmapMilestone[] {
  return roadmap.milestones.filter(
    (milestone) => milestone.status === "completed",
  );
}