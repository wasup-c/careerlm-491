import {
  extractResumeText,
  type ValidatedResumeSource,
} from "@/lib/services/resume-extraction";

import {
  parseResumeText,
} from "@/lib/services/resume-normalization";

export async function processResume(
  source: ValidatedResumeSource
) {
  const extractedText = await extractResumeText(source);

  return parseResumeText(extractedText);
}