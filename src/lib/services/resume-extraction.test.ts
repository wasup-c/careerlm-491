
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

    expect(text).toContain("John Doe");
    expect(text).toContain("Python");
  });

  it("handles corrupted PDF contents", async () => {
    await expect(
      extractResumeText({
        kind: "pdf",
        bytes: new Uint8Array([1, 2, 3, 4]),
      })
    ).rejects.toBeInstanceOf(
      ResumeExtractionError
    );
  });
});
