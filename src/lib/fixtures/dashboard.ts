import type { RoadmapProgress } from "@/lib/roadmapProgress";
import type { TemporaryDashboardProfile } from "@/types/dashboard";

/**
 * Contract-compatible fixture data for building and testing the
 * dashboard before the real profile and progress services exist.
 */
export const completeProfile: TemporaryDashboardProfile = {
  name: "Alex Rivera",
  targetRole: "Frontend Engineer",
  experienceLevel: "intermediate",
};

export const partialProfile: TemporaryDashboardProfile = {
  targetRole: "Data Analyst",
};

export const emptyProfile: TemporaryDashboardProfile = {};

export const sampleProgress: RoadmapProgress = {
  completedMilestones: 1,
  totalMilestones: 3,
  progressPercentage: 33,
};
