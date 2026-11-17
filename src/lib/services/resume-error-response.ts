import {
  ResumeExtractionError,
} from "./resume-extraction";

import {
  ResumeNormalizationError,
} from "./resume-normalization";

export function toResumeErrorResponse(error: unknown) {
  if (error instanceof ResumeExtractionError) {
    return {
      ok: false as const,
      code: error.code,
      message:
        error.code === "UNREADABLE_RESUME"
          ? "No readable resume text was found. Try pasting your resume text."
          : "We couldn't read that PDF. Try another file or paste its text.",
    };
  }

  if (error instanceof ResumeNormalizationError) {
    if (error.code === "MISSING_RESUME_SECTIONS") {
      return {
        ok: false as const,
        code: error.code,
        message:
          "Include at least one populated section: Education, Experience, Skills, or Projects.",
      };
    }

  // Keep your existing handling for other errors.
  }

  return {
    ok: false as const,
    code: "PROCESSING_FAILED" as const,
    message: "We couldn't process your resume. Please try again.",
  };
}
