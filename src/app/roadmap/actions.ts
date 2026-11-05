"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  careerDataService,
} from "@/lib/services";

import type {
  MilestoneStatus,
} from "@/types/career";

const VALID_STATUSES =
  new Set<MilestoneStatus>(
    [
      "not-started",
      "in-progress",
      "completed",
    ]
  );

export async function updateMilestoneStatusAction(
  formData:
    FormData
): Promise<void> {
  const milestoneId =
    formData.get(
      "milestoneId"
    );

  const status =
    formData.get(
      "status"
    );

  if (
    typeof milestoneId !==
      "string" ||
    !milestoneId.trim()
  ) {
    throw new Error(
      "A milestone ID is required."
    );
  }

  if (
    typeof status !==
      "string" ||
    !VALID_STATUSES.has(
      status as
        MilestoneStatus
    )
  ) {
    throw new Error(
      "A valid milestone status is required."
    );
  }

  await careerDataService
    .updateMyMilestoneStatus(
      milestoneId.trim(),

      status as
        MilestoneStatus
    );

  revalidatePath(
    "/roadmap"
  );

  revalidatePath(
    "/dashboard"
  );

  revalidatePath(
    "/portfolio"
  );
}