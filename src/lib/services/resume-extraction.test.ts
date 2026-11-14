
/* @vitest-environment node */

import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

import {
  extractResumeText,
  ResumeExtractionError,
} from "./resume-extraction";

describe("Resume extraction service", () => {
  it("returns valid pasted text", async () => {
    const text = await extractResumeText({
      kind: "text",
      text: "John Doe\nSkills: Python",
    });

    expect(text).toContain("John Doe");
    expect(text).toContain("Python");
  });

  it("rejects empty text", async () => {
    await expect(
      extractResumeText({
        kind: "text",
        text: "   ",
      })
    ).rejects.toMatchObject({
      code: "UNREADABLE_RESUME",
    });
  });

  it("extracts readable PDF content", async () => {
    // Create this synthetic PDF fixture first.
    const bytes = await readFile(
      new URL(
        "../fixtures/sample-resume.pdf",
        import.meta.url
      )
    );

    const text = await extractResumeText({
      kind: "pdf",
      bytes,
    });

    const normalizedText = text
    .replace(/\s+/g, " ")
    .toLowerCase();

    expect(normalizedText).toMatch(/j\s*o\s*h\s*n\s+d\s*o\s*e/i);
    expect(normalizedText).toMatch(/python/i);
  });

  
  it("RN-09 returns controlled extraction exceptions", async () => {
    // Arrange: Invalid PDF content simulates a parsing failure.
    const corruptedPdf = new Uint8Array([1, 2, 3, 4]);

    // Act and Assert: Verify the real extraction service
    // converts the failure into a controlled error.
    let caughtError: unknown;

    try {
      await extractResumeText({
        kind: "pdf",
        bytes: corruptedPdf,
      });
    } catch (error) {
      caughtError = error;
    }

    // Assert: Verify the correct custom error class
    expect(caughtError).toBeInstanceOf(ResumeExtractionError);
    expect(caughtError).toMatchObject({
      name: "ResumeExtractionError",
      code: "EXTRACTION_FAILED",
      message: "Unable to extract text from the PDF.",
    });
  });
});
