// [S4-M2] Résumé submission — server-side save, load and delete for the
// /resume page, scoped to the current user through CareerDataService.
//
// Privacy: résumé text is never logged, and error messages never repeat
// any of it. Parsing résumé text into sections belongs to Member 3's
// résumé-processing layer, so sections are saved empty until that exists.

import { AuthenticationRequiredError } from "@/lib/auth";
import type { ResumeInput } from "@/lib/persistence";
import type { CareerDataService } from "@/lib/services";
import { validateResumeText } from "@/lib/resumeLimits";

export interface SavedResumeSummary {
  text: string;
  characterCount: number;
  updatedAt: string;
}

export type ResumeSaveResult =
  | { ok: true; resume: SavedResumeSummary }
  | { ok: false; message: string; fieldError?: string };

export type ResumeDeleteResult = { ok: true } | { ok: false; message: string };

const SIGNED_OUT_MESSAGE =
  "Your session has ended. Please sign in again to save your résumé.";

export function readResumeText(raw: unknown): string {
  return typeof raw === "string" ? raw.trim() : "";
}

export async function loadSavedResume(
  service: Pick<CareerDataService, "getMyResume">,
): Promise<SavedResumeSummary | null> {
  const resume = await service.getMyResume();

  if (!resume) {
    return null;
  }

  return {
    text: resume.normalizedText,
    characterCount: resume.normalizedText.length,
    updatedAt: resume.updatedAt,
  };
}

export async function saveResumeText(
  service: Pick<CareerDataService, "saveMyResume">,
  raw: unknown,
): Promise<ResumeSaveResult> {
  const text = readResumeText(raw);
  const fieldError = validateResumeText(text);

  if (fieldError) {
    return { ok: false, message: "Your résumé needs attention.", fieldError };
  }

  const input: ResumeInput = {
    normalizedText: text,
    sections: { education: [], experience: [], skills: [], projects: [] },
  };

  try {
    const saved = await service.saveMyResume(input);

    return {
      ok: true,
      resume: {
        text: saved.normalizedText,
        characterCount: saved.normalizedText.length,
        updatedAt: saved.updatedAt,
      },
    };
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return { ok: false, message: SIGNED_OUT_MESSAGE };
    }

    return {
      ok: false,
      message:
        "We couldn't save your résumé. Your text is still here, so you can try again.",
    };
  }
}

export async function deleteSavedResume(
  service: Pick<CareerDataService, "deleteMyResume">,
): Promise<ResumeDeleteResult> {
  try {
    await service.deleteMyResume();
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return { ok: false, message: SIGNED_OUT_MESSAGE };
    }

    return {
      ok: false,
      message: "We couldn't delete your résumé. Please try again.",
    };
  }
}
