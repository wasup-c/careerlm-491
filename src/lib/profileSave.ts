import { AuthenticationRequiredError } from "@/lib/auth";
import {
  PersistenceValidationError,
  type ExperienceLevel,
  type ProfileInput,
} from "@/lib/persistence";
import type { CareerDataService } from "@/lib/services";
import type { ProfileUpdateResult } from "@/lib/fixtures/mockProfileService";
import type { TemporaryDashboardProfile } from "@/types/dashboard";

// SCRUM-226 [S4-M2-SEC-3] — SOC 2 CC6.1 remediation for finding F1.
// Replaces the dashboard's mock profile save with a real, current-user-scoped
// save through Member 1's CareerDataService.

const EXPERIENCE_LEVELS: readonly ExperienceLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
];

/** Returns a trimmed string, or undefined for anything else (including blanks). */
function readText(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() || undefined : undefined;
}

/**
 * Builds the profile input from untrusted client data.
 *
 * Only the three editable profile fields are copied. Anything else the
 * browser sends (for example a forged `userId`) is dropped here, and the
 * owner is always resolved on the server by CareerDataService.
 */
export function toProfileInput(raw: unknown): ProfileInput {
  const data =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};

  const experienceLevel = readText(data.experienceLevel);

  return {
    name: readText(data.name),
    targetRole: readText(data.targetRole),
    experienceLevel: EXPERIENCE_LEVELS.includes(experienceLevel as ExperienceLevel)
      ? (experienceLevel as ExperienceLevel)
      : undefined,
  };
}

/**
 * Saves the current user's dashboard profile.
 *
 * Server-only: call this from a server action, never from a client component.
 * Returns the same result shape the edit form already handles, so the UI does
 * not change.
 */
export async function saveDashboardProfile(
  service: Pick<CareerDataService, "saveMyProfile">,
  raw: unknown,
): Promise<ProfileUpdateResult> {
  const input = toProfileInput(raw);

  if (!input.targetRole) {
    return {
      ok: false,
      message: "Some fields need attention.",
      fieldErrors: { targetRole: "Target role is required." },
    };
  }

  try {
    const saved = await service.saveMyProfile(input);

    const profile: TemporaryDashboardProfile = {
      name: saved.name,
      targetRole: saved.targetRole,
      experienceLevel: saved.experienceLevel,
    };

    return { ok: true, profile };
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return {
        ok: false,
        message: "Your session has ended. Please sign in again to save your profile.",
      };
    }

    if (error instanceof PersistenceValidationError) {
      return { ok: false, message: error.message };
    }

    return {
      ok: false,
      message:
        "We couldn't save your profile. Your changes are still here, so you can try again.",
    };
  }
}
