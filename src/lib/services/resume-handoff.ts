import type {
  ResumeRecord,
} from "@/lib/persistence/domain";

import type {
  CareerDataService,
} from "@/lib/services/career-data-service";

import {
    extractResumeText,
  type ValidatedResumeSource,
} from "@/lib/services/resume-extraction";

import { parseResumeText } from "./resume-normalization";

type ResumeSaveService = Pick<
  CareerDataService,
  "saveMyResume"
>;

export async function processAndSaveResume(
  source: ValidatedResumeSource,
  service: ResumeSaveService
): Promise<ResumeRecord> {
  // Extract and normalize the validated content.
  const extractedText = await extractResumeText(source);
  const parsedResume = await parseResumeText(extractedText);

  // Save using the existing current-user boundary.
  return service.saveMyResume(parsedResume);
}
