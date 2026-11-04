"use server";

import {
  saveDashboardProfile,
} from "@/lib/profileSave";

import {
  careerDataService,
} from "@/lib/services";

import type {
  DashboardProfile,
  ProfileUpdateResult,
} from "@/types/profile";

export async function saveProfileAction(
  profile:
    DashboardProfile
): Promise<ProfileUpdateResult> {
  return saveDashboardProfile(
    careerDataService,
    profile
  );
}