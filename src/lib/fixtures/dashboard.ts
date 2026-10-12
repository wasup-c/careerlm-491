import type {
  TemporaryDashboardProfile,
  TemporaryRoadmapProgress,
} from "@/types/dashboard";

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

export const sampleProgress: TemporaryRoadmapProgress = {
  completedMilestones: 1,
  totalMilestones: 3,
  percentComplete: 33,
};
