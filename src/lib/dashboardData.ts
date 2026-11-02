import type { CareerDataService } from "@/lib/services";
import type { ProfileRecord, QuestionnaireRecord } from "@/lib/persistence";
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
 * Builds the dashboard profile for the current user.
 *
 * SCRUM-231 [S4-M2-SEC-7] (CC6.1 finding F2): a profile the user saved from
 * the dashboard wins. Any field the saved profile leaves empty falls back to
 * the questionnaire, so new users still see their onboarding answers.
 */
export function toDashboardProfile(
  questionnaire: QuestionnaireRecord | null,
  savedProfile: ProfileRecord | null = null,
): TemporaryDashboardProfile {
  const profile: TemporaryDashboardProfile = {
    name: savedProfile?.name,
    targetRole: savedProfile?.targetRole ?? questionnaire?.targetRole,
    experienceLevel:
      savedProfile?.experienceLevel ?? questionnaire?.experienceLevel,
  };

  // Leave unset fields out so the cards show "Not set yet".
  return Object.fromEntries(
    Object.entries(profile).filter(([, value]) => value !== undefined),
  ) as TemporaryDashboardProfile;
}

/**
 * Reads the current user's saved profile, questionnaire, and roadmap through
 * Member 1's CareerDataService.
 *
 * Server-only: the service reads the server-side repository, so call this
 * from a server component, never from a client component.
 */
export async function loadDashboardData(
  service: Pick<
    CareerDataService,
    "getMyProfile" | "getMyQuestionnaire" | "getMyRoadmap"
  >,
): Promise<DashboardData> {
  const [savedProfile, questionnaire, roadmap] = await Promise.all([
    service.getMyProfile(),
    service.getMyQuestionnaire(),
    service.getMyRoadmap(),
  ]);

  return {
    profile: toDashboardProfile(questionnaire, savedProfile),
    progress: toDashboardProgress(roadmap),
  };
}
