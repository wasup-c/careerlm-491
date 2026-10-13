import type { TemporaryDashboardProfile } from "@/types/dashboard";

/**
 * TEMPORARY Sprint 3 mock of the profile update boundary.
 *
 * Member 3 owns the real profile service and its validation rules.
 * This mock only imitates the kinds of responses the dashboard must
 * handle (success, field errors, failure) so the edit form can be built
 * and tested now. Replace it with Member 3's service once merged.
 */

export type ProfileField = keyof TemporaryDashboardProfile;

export type ProfileUpdateResult =
  | { ok: true; profile: TemporaryDashboardProfile }
  | {
      ok: false;
      message: string;
      fieldErrors?: Partial<Record<ProfileField, string>>;
    };

export type SaveProfile = (
  profile: TemporaryDashboardProfile,
) => Promise<ProfileUpdateResult>;

const MOCK_DELAY_MS = 600;

export const mockSaveProfile: SaveProfile = async (profile) => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  // Stand-in for a server-side validation response, not a real rule.
  if (!profile.targetRole?.trim()) {
    return {
      ok: false,
      message: "Some fields need attention.",
      fieldErrors: { targetRole: "Target role is required." },
    };
  }

  return { ok: true, profile };
};
