
import {
  ResumeExtractionError,
} from "./resume-extraction";

import {
  ResumeNormalizationError,
} from "./resume-normalization";

export function toResumeErrorResponse(error: unknown) {
  // Handle PDF and plain-text extraction errors.
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

  // Handle normalization and section-validation errors.
  if (error instanceof ResumeNormalizationError) {
    switch (error.code) {
      case "MISSING_RESUME_SECTIONS":
        return {
          ok: false as const,
          code: error.code,
          message:
            "Include at least one populated section: Education, Experience, Skills, or Projects.",
        };

      case "INVALID_RESUME_TEXT":
        return {
          ok: false as const,
          code: error.code,
          message:
            "Your resume contains text that couldn't be processed.",
        };

      case "NORMALIZATION_FAILED":
        return {
          ok: false as const,
          code: error.code,
          message:
            "We couldn't process your resume. Please try again.",
        };
    }
  }

  // Never expose unknown internal errors to the client.
  return {
    ok: false as const,
    code: "PROCESSING_FAILED" as const,
    message:
      "We couldn't process your resume. Please try again.",
  };
}
