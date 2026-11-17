import { describe, expect, it } from "vitest";
import { toResumeErrorResponse } from "./resume-error-response";
import { ResumeExtractionError } from "./resume-extraction";
import { ResumeNormalizationError } from "./resume-normalization";

describe("Resume error response service", () => {
  it("returns a controlled error for ResumeExtractionError", () => {
    const error = new ResumeExtractionError(
      "UNREADABLE_RESUME",
      "The resume contains no extractable text."
    );

    const response = toResumeErrorResponse(error);

    expect(response).toEqual({
      ok: false,
      code: "UNREADABLE_RESUME",
      message: "No readable resume text was found. Try pasting your resume text.",
    });
  });

  it("returns a controlled error for ResumeNormalizationError", () => {
    const error = new ResumeNormalizationError(
      "INVALID_RESUME_TEXT",
      "Your resume contains text that couldn't be processed."
    );

    const response = toResumeErrorResponse(error);

    expect(response).toEqual({
      ok: false,
      code: "INVALID_RESUME_TEXT",
      message: "Your resume contains text that couldn't be processed.",
    });
  });

  it("returns a generic error for unknown errors", () => {
    const error = new Error("Some unexpected error");

    const response = toResumeErrorResponse(error);

    expect(response).toEqual({
      ok: false,
      code: "PROCESSING_FAILED",
      message: "We couldn't process your resume. Please try again.",
    });
  });


  it("returns a controlled error for missing resume sections", () => {
    const error = new ResumeNormalizationError(
      "MISSING_RESUME_SECTIONS",
      "Internal validation details"
    );

    expect(toResumeErrorResponse(error)).toEqual({
      ok: false,
      code: "MISSING_RESUME_SECTIONS",
      message:
        "Include at least one populated section: Education, Experience, Skills, or Projects.",
    });
  });

  it("returns a safe normalization failure response", () => {
    const error = new ResumeNormalizationError(
      "NORMALIZATION_FAILED",
      "Internal parser failure"
    );

    const response = toResumeErrorResponse(error);

    expect(response).toEqual({
      ok: false,
      code: "NORMALIZATION_FAILED",
      message:
        "We couldn't process your resume. Please try again.",
    });

    expect(response.message).not.toContain(
      "Internal parser failure"
    );
  });
});