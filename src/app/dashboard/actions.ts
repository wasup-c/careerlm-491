"use server";

// SCRUM-226 [S4-M2-SEC-3] — server action for dashboard profile saves (CC6.1).
// Runs on the server, so the browser never chooses whose profile is saved:
// CareerDataService resolves the current user on every call.

import { saveDashboardProfile } from "@/lib/profileSave";
import { careerDataService } from "@/lib/services";
import type { ProfileUpdateResult } from "@/lib/fixtures/mockProfileService";
import type { TemporaryDashboardProfile } from "@/types/dashboard";

export async function saveProfileAction(
  profile: TemporaryDashboardProfile,
): Promise<ProfileUpdateResult> {
  return saveDashboardProfile(careerDataService, profile);
}
