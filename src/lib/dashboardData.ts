import type { CareerDataService } from "@/lib/services";
import type { QuestionnaireRecord } from "@/lib/persistence";
import {
  getRoadmapProgress,
  type RoadmapProgress,
} from "@/lib/roadmapProgress";
import type { TemporaryDashboardProfile } from "@/types/dashboard";

export interface DashboardData {
  profile: TemporaryDashboardProfile;
  progress: RoadmapProgress | null;
}

/** Any roadmap with milestones: a saved RoadmapRecord or a generated roadmap. */
type DashboardRoadmap = {
  milestones: Parameters<typeof getRoadmapProgress>[0];
};

/**
 * Returns Member 4's shared RoadmapProgress for a roadmap, or null when the
 * user has no roadmap. The calculation itself stays in getRoadmapProgress.
 */
export function toDashboardProgress(
  roadmap: DashboardRoadmap | null,
): RoadmapProgress | null {
  return roadmap ? getRoadmapProgress(roadmap.milestones) : null;
}

/**
 * Maps the saved questionnaire into the dashboard profile.
 *
 * The questionnaire has no name field, so name stays unset ("Not set yet")
 * until the profile owner adds one to the shared profile contract.
 */
export function toDashboardProfile(
  questionnaire: QuestionnaireRecord | null,
): TemporaryDashboardProfile {
  if (!questionnaire) return {};

  return {
    targetRole: questionnaire.targetRole,
    experienceLevel: questionnaire.experienceLevel,
  };
}

/**
 * Reads the current user's saved questionnaire and roadmap through
 * Member 1's CareerDataService.
 *
 * Server-only: the service reads the server-side repository, so call this
 * from a server component, never from a client component.
 */
export async function loadDashboardData(
  service: Pick<CareerDataService, "getMyQuestionnaire" | "getMyRoadmap">,
): Promise<DashboardData> {
  const [questionnaire, roadmap] = await Promise.all([
    service.getMyQuestionnaire(),
    service.getMyRoadmap(),
  ]);

  return {
    profile: toDashboardProfile(questionnaire),
    progress: toDashboardProgress(roadmap),
  };
}
