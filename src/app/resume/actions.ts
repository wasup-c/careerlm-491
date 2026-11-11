"use server";

import {
  deleteSavedResume,
  saveResumeText,
  type ResumeDeleteResult,
  type ResumeSaveResult,
} from "@/lib/resumeSave";
import { careerDataService } from "@/lib/services";

// The browser sends only the résumé text. The current user is resolved on
// the server by CareerDataService, so no user ID ever comes from the client.

export async function saveResumeAction(text: string): Promise<ResumeSaveResult> {
  return saveResumeText(careerDataService, text);
}

export async function deleteResumeAction(): Promise<ResumeDeleteResult> {
  return deleteSavedResume(careerDataService);
}
