import type {
  CareerDataService,
} from "@/lib/services";

import type {
  ProfileRecord,
  QuestionnaireRecord,
} from "@/lib/persistence";

import {
  getRoadmapProgress,
  type RoadmapProgress,
} from "@/lib/roadmapProgress";

import type {
  DashboardProfile,
} from "@/types/profile";

export interface DashboardData {
  profile:
    DashboardProfile;

  progress:
    RoadmapProgress | null;
}

type DashboardRoadmap = {
  milestones:
    Parameters<
      typeof getRoadmapProgress
    >[0];
};

export function toDashboardProgress(
  roadmap:
    DashboardRoadmap | null
): RoadmapProgress | null {
  return roadmap
    ? getRoadmapProgress(
        roadmap.milestones
      )
    : null;
}

export function toDashboardProfile(
  questionnaire:
    QuestionnaireRecord | null,
  savedProfile:
    ProfileRecord | null =
      null
): DashboardProfile {
  const profile:
    DashboardProfile = {
      name:
        savedProfile?.name,

      targetRole:
        savedProfile
          ?.targetRole ??
        questionnaire
          ?.targetRole,

      experienceLevel:
        savedProfile
          ?.experienceLevel ??
        questionnaire
          ?.experienceLevel,
    };

  return Object.fromEntries(
    Object.entries(
      profile
    ).filter(
      ([
        ,
        value,
      ]) =>
        value !==
        undefined
    )
  ) as DashboardProfile;
}

export async function loadDashboardData(
  service:
    Pick<
      CareerDataService,
      | "getMyProfile"
      | "getMyQuestionnaire"
      | "getMyRoadmap"
    >
): Promise<DashboardData> {
  const [
    savedProfile,
    questionnaire,
    roadmap,
  ] =
    await Promise.all([
      service
        .getMyProfile(),

      service
        .getMyQuestionnaire(),

      service
        .getMyRoadmap(),
    ]);

  return {
    profile:
      toDashboardProfile(
        questionnaire,
        savedProfile
      ),

    progress:
      toDashboardProgress(
        roadmap
      ),
  };
}