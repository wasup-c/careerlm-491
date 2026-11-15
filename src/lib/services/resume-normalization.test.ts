/* @vitest-environment node */

import { describe, expect, it } from "vitest";
import { normalizeResume } from "../persistence/validation";
import {
  parseResumeText,
  ResumeNormalizationError,
} from "./resume-normalization";

describe("S4-M3-02: resume normalization and section detection", () => {
  it("identifies all four sections regardless of capitalization", () => {
    const result = parseResumeText(
      "Jane Doe\r\neDuCaTiOn\r\nB.S. Computer Science\r\n" +
        "WORK EXPERIENCE\r\nSoftware Engineer - Example Co.\r\n" +
        "tEcHnIcAl SkIlLs\r\nC++, C#, Node.js\r\n" +
        "PROJECTS\r\nCareerLM - Career platform",
    );

    expect(result.sections).toEqual({
      education: ["B.S. Computer Science"],
      experience: ["Software Engineer - Example Co."],
      skills: ["C++", "C#", "Node.js"],
      projects: ["CareerLM - Career platform"],
    });
    expect(result.normalizedText).not.toContain("\r");
  });

  it("returns empty arrays for missing sections", () => {
    expect(parseResumeText("Education\nB.S. Computer Science").sections).toEqual({
      education: ["B.S. Computer Science"],
      experience: [],
      skills: [],
      projects: [],
    });
    expect(parseResumeText("Jane Doe\nSoftware Engineer").sections).toEqual({
      education: [], experience: [], skills: [], projects: [],
    });
  });

  it("preserves punctuation, inline headings and skill category labels", () => {
    const result = parseResumeText(
      "Technical Skills: C++, C#, Node.js\nLanguages: TypeScript; R&D|CI/CD",
    );
    expect(result.sections.skills).toEqual([
      "C++", "C#", "Node.js", "TypeScript", "R&D", "CI/CD",
    ]);
  });

  it("normalizes extraction artifacts without removing useful content", () => {
    const result = parseResumeText(
      "  EDUCATION\r\n\r\n\r\n\u00a0 B.S.   Computer Science  \fProjects\n\u2022  CareerLM  ",
    );
    expect(result.normalizedText).toBe(
      "EDUCATION\n\nB.S. Computer Science\nProjects\n\u2022 CareerLM",
    );
    expect(result.sections.projects).toEqual(["CareerLM"]);
  });

  it("does not misclassify content or unrelated sections", () => {
    const result = parseResumeText(
      "Experience\nWorked on an education platform\nCertifications\nAWS Certified\nProjects\nCareerLM",
    );
    expect(result.sections.experience).toEqual(["Worked on an education platform"]);
    expect(result.sections.projects).toEqual(["CareerLM"]);
  });

  it("appends repeated section headings and deduplicates exact entries", () => {
    const result = parseResumeText(
      "Skills\nC++\nSKILLS\nC++\nNode.js",
    );
    expect(result.sections.skills).toEqual(["C++", "Node.js"]);
  });

  it("is deterministic and idempotent", () => {
    const raw = " Skills: C++ , C#, Node.js\r\nProjects\n CareerLM ";
    const once = parseResumeText(raw);
    expect(parseResumeText(raw)).toEqual(once);
    expect(parseResumeText(once.normalizedText)).toEqual(once);
    expect(normalizeResume(once)).toEqual(once);
  });

  it("provides controlled errors for invalid and unreadable text", () => {
    for (const raw of ["", " \n ", "Name\u0000Bad", "a".repeat(100_001)]) {
      try {
        parseResumeText(raw);
        throw new Error("Expected parsing to reject invalid text");
      } catch (error) {
        expect(error).toBeInstanceOf(ResumeNormalizationError);
        expect(error).toMatchObject({ code: "INVALID_RESUME_TEXT" });
      }
    }
  });
});