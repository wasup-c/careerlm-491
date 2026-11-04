import {
  AuthenticationRequiredError,
} from "@/lib/auth";

import {
  PersistenceValidationError,
  type ExperienceLevel,
  type ProfileInput,
} from "@/lib/persistence";

import type {
  CareerDataService,
} from "@/lib/services";

import type {
  DashboardProfile,
  ProfileUpdateResult,
} from "@/types/profile";

const EXPERIENCE_LEVELS:
  readonly ExperienceLevel[] = [
    "beginner",
    "intermediate",
    "advanced",
  ];

function readText(
  value: unknown
): string | undefined {
  return typeof value ===
    "string"
    ? value.trim() ||
        undefined
    : undefined;
}

export function toProfileInput(
  raw: unknown
): ProfileInput {
  const data =
    typeof raw ===
      "object" &&
    raw !== null
      ? (raw as Record<
          string,
          unknown
        >)
      : {};

  const experienceLevel =
    readText(
      data.experienceLevel
    );

  return {
    name:
      readText(
        data.name
      ),

    targetRole:
      readText(
        data.targetRole
      ),

    experienceLevel:
      EXPERIENCE_LEVELS.includes(
        experienceLevel as
          ExperienceLevel
      )
        ? (experienceLevel as ExperienceLevel)
        : undefined,
  };
}

export async function saveDashboardProfile(
  service:
    Pick<
      CareerDataService,
      "saveMyProfile"
    >,
  raw: unknown
): Promise<ProfileUpdateResult> {
  const input =
    toProfileInput(raw);

  if (
    !input.targetRole
  ) {
    return {
      ok: false,

      message:
        "Some fields need attention.",

      fieldErrors: {
        targetRole:
          "Target role is required.",
      },
    };
  }

  try {
    const saved =
      await service
        .saveMyProfile(
          input
        );

    const profile:
      DashboardProfile = {
        name:
          saved.name,

        targetRole:
          saved.targetRole,

        experienceLevel:
          saved
            .experienceLevel,
      };

    return {
      ok: true,
      profile,
    };
  } catch (error) {
    if (
      error instanceof
      AuthenticationRequiredError
    ) {
      return {
        ok: false,

        message:
          "Your session has ended. Please sign in again to save your profile.",
      };
    }

    if (
      error instanceof
      PersistenceValidationError
    ) {
      return {
        ok: false,
        message:
          error.message,
      };
    }

    return {
      ok: false,

      message:
        "We couldn't save your profile. Your changes are still here, so you can try again.",
    };
  }
}