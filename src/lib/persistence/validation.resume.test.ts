import { describe, expect, it } from "vitest";

import type { ResumeInput } from "./domain";
import { PersistenceValidationError } from "./errors";
import { normalizeResume } from "./validation";

function makeResume(text: string): ResumeInput {
  return {
    normalizedText: text,
    sections: {
      education: [],
      experience: [],
      skills: ["C++", "C#", "R&D"],
      projects: [],
    },
  };
}


describe("SCRUM-243: Resume Text Normalization", () => {
  // RN-01 — Valid resume content preservation
  it("RN-01 preserves valid resume text and skills", () => {
    const input = makeResume("Alex Chen\nSKILLS\nC++");

    const result = normalizeResume(input);

    expect(result.normalizedText).toBe(
      "Alex Chen\nSKILLS\nC++"
    );
    expect(result.sections.skills).toEqual([
      "C++",
      "C#",
      "R&D",
    ]);
  });

  // RN-02 — Empty text rejection
  it("RN-02 rejects an empty resume", () => {
    const input = makeResume("");

    expect(() => normalizeResume(input)).toThrow(
      PersistenceValidationError
    );
    expect(() => normalizeResume(input)).toThrow(
      "Resume normalized text is required."
    );
  });

  // RN-03 — Whitespace-only rejection
  it("RN-03 rejects whitespace-only text", () => {
    const input = makeResume(" \t\n ");

    expect(() => normalizeResume(input)).toThrow(
      PersistenceValidationError
    );
  });

  // RN-04 — Unicode normalization
  it("RN-04 preserves Unicode and normalizes to NFC", () => {
    const input = makeResume(
      "Jose\u0301\nC#, R&D\n東京"
    );

    const result = normalizeResume(input);

    expect(result.normalizedText).toBe(
      "José\nC#, R&D\n東京"
    );
  });

  // RN-05 — Whitespace normalization
  it("RN-05 removes trailing whitespace per line", () => {
    const input = makeResume(
      "NAME \n • Engineer "
    );

    const result = normalizeResume(input);

    expect(result.normalizedText).toBe(
      "NAME\n • Engineer"
    );
  });

  // RN-06 — Line ending normalization
  it("RN-06 converts CRLF and CR to LF", () => {
    const input = makeResume(
      "A\r\nB\rC"
    );

    const result = normalizeResume(input);

    expect(result.normalizedText).toBe(
      "A\nB\nC"
    );
  });

  // RN-07 — Invalid control character rejection
  it("RN-07 rejects NUL characters", () => {
    const input = makeResume("A\u0000B");

    expect(() => normalizeResume(input)).toThrow(
      PersistenceValidationError
    );
  });

  const MAX_RESUME_TEXT_LENGTH = 100_000;

  // RN-08A — Maximum accepted length
  it("RN-08A accepts text at the length boundary", () => {
    const text = "A".repeat(MAX_RESUME_TEXT_LENGTH);
    const input = makeResume(text);

    const result = normalizeResume(input);

    expect(result.normalizedText).toBe(text);
  });

  // RN-08B — Maximum length exceeded
  it("RN-08B rejects oversized resume text", () => {
    const text = "A".repeat(
      MAX_RESUME_TEXT_LENGTH + 1
    );
    const input = makeResume(text);

    expect(() => normalizeResume(input)).toThrow(
      PersistenceValidationError
    );
  });
  
  it("RN-12 produces identical output after re-normalization", () => {
    // Arrange: Synthetic resume with extra whitespace,
    // duplicate skills, and duplicate education entries.
    const input: ResumeInput = {
      normalizedText: "  Alex Chen\nSKILLS\nC++  ",
      sections: {
        education: [
          " B.S. Computer Science ",
          "B.S. Computer Science",
          " ",
        ],
        experience: [
          " Software Engineer ",
        ],
        skills: [
          " C++ ",
          " C# ",
          "C++",
          "R&D",
        ],
        projects: [
          " CareerLM ",
        ],
      },
    };

    // Act: Normalize the input twice.
    const firstResult = normalizeResume(input);
    const secondResult = normalizeResume(firstResult);

    // Assert: Verify the first normalization result.
    expect(firstResult).toEqual({
      normalizedText: "Alex Chen\nSKILLS\nC++",
      sections: {
        education: ["B.S. Computer Science"],
        experience: ["Software Engineer"],
        skills: ["C++", "C#", "R&D"],
        projects: ["CareerLM"],
      },
    });

    // Assert: Re-normalization must not change the result.
    expect(secondResult).toEqual(firstResult);
  });
});