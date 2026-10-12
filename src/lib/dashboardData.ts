import { completeProfile } from "@/lib/fixtures/dashboard";
import { mockRoadmap } from "@/lib/mockRoadmap";
import { getRoadmapProgress } from "@/lib/roadmapProgress";
import type { CareerRoadmap } from "@/types/career";
import type {
  TemporaryDashboardProfile,
  TemporaryRoadmapProgress,
} from "@/types/dashboard";

export interface DashboardData {
  profile: TemporaryDashboardProfile;
  progress: TemporaryRoadmapProgress | null;
}

/**
 * Converts Member 4's progress result into the dashboard's progress shape.
 * The calculation itself stays in getRoadmapProgress (Member 4).
 */
export function toDashboardProgress(
  roadmap: CareerRoadmap | null,
): TemporaryRoadmapProgress | null {
  if (!roadmap) return null;

  const { completedMilestones, totalMilestones, progressPercentage } =
    getRoadmapProgress(roadmap.milestones);

  return {
    completedMilestones,
    totalMilestones,
    percentComplete: progressPercentage,
  };
}

/**
 * Builds the data shown on the dashboard from the current roadmap.
 *
 * The roadmap comes from the same source as the /roadmap page, so both
 * pages always agree on target role and progress. Once roadmaps are saved
 * through Member 1's careerDataService, pass that roadmap in instead.
 *
 * Name and experience level still come from fixtures until Member 3's
 * profile service is available.
 */
export function getDashboardData(
  roadmap: CareerRoadmap | null = mockRoadmap,
): DashboardData {
  return {
    profile: {
      ...completeProfile,
      targetRole: roadmap?.targetRole ?? completeProfile.targetRole,
    },
    progress: toDashboardProgress(roadmap),
  };
}
