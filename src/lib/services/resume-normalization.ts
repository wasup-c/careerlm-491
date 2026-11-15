import type { ResumeInput, ResumeSections } from "../persistence/domain";
import { PersistenceValidationError } from "../persistence/errors";
import { normalizeResume } from "../persistence/validation";

type SectionKey = keyof ResumeSections;

const SECTION_ALIASES: Record<string, SectionKey> = {
  education: "education",
  "academic background": "education",
  "academic history": "education",
  experience: "experience",
  "work experience": "experience",
  "professional experience": "experience",
  "employment history": "experience",
  skills: "skills",
  "technical skills": "skills",
  "core competencies": "skills",
  "technical proficiencies": "skills",
  projects: "projects",
  "personal projects": "projects",
  "academic projects": "projects",
  "selected projects": "projects",
};

// Known sections outside the four-section persistence contract should stop
// collection of the preceding section, not be misclassified as its content.
const OTHER_HEADINGS = new Set([
  "summary",
  "professional summary",
  "objective",
  "certifications",
  "awards",
  "publications",
  "interests",
  "references",
  "volunteer experience",
  "additional information",
]);

export type ResumeNormalizationErrorCode =
  | "INVALID_RESUME_TEXT"
  | "NORMALIZATION_FAILED";

export class ResumeNormalizationError extends Error {
  constructor(
    public readonly code: ResumeNormalizationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ResumeNormalizationError";
  }
}

function emptySections(): ResumeSections {
  return { education: [], experience: [], skills: [], projects: [] };
}

function headingFor(
  line: string,
): { section: SectionKey | null; remainder: string } | null {
  const visible = line.replace(/^#{1,6}\s+/, "").replace(/\*\*/g, "").trim();
  const colonPosition = visible.indexOf(":");
  const label = (colonPosition >= 0 ? visible.slice(0, colonPosition) : visible)
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  const remainder = colonPosition >= 0 ? visible.slice(colonPosition + 1).trim() : "";

  if (Object.prototype.hasOwnProperty.call(SECTION_ALIASES, label)) {
    return { section: SECTION_ALIASES[label], remainder };
  }
  if (OTHER_HEADINGS.has(label)) {
    return { section: null, remainder: "" };
  }
  return null;
}

function addLine(sections: ResumeSections, section: SectionKey, rawLine: string): void {
  const value = rawLine.replace(/^[-*\u2022\u25aa\u25e6]\s+/, "").trim();
  if (!value) return;

  if (section === "skills") {
    const uncategorized = value.replace(
      /^(?:languages|programming languages|frameworks|libraries|databases|tools|technologies)\s*:\s*/i,
      "",
    );
    // Splitting only on explicit separators preserves C++, C#, Node.js,
    // CI/CD, R&D, and skill names containing punctuation.
    for (const skill of uncategorized.split(/[,;|]/u)) {
      const trimmed = skill.trim();
      if (trimmed) sections.skills.push(trimmed);
    }
  } else {
    sections[section].push(value);
  }
}

/**
 * Converts extracted PDF or plain-text resume content to the shared ResumeInput.
 * File validation, authentication, storage, and scoring live elsewhere.
 */
export function parseResumeText(rawText: string): ResumeInput {
  if (typeof rawText !== "string") {
    throw new ResumeNormalizationError(
      "INVALID_RESUME_TEXT",
      "Resume text must be a string.",
    );
  }

  try {
    // Only clean known extraction artifacts. Other invalid control characters
    // still go through the persistence validator and cause controlled errors.
    const prepared = rawText
      .replace(/\f/g, "\n")
      .replace(/\u00a0/g, " ")
      .replace(/\u200b/g, "");

    // Reuse existing Unicode, line-ending, size, and control-char rules.
    const firstPass = normalizeResume({
      normalizedText: prepared,
      sections: emptySections(),
    });

    // Preserve line boundaries, punctuation, dates, and bullet content.
    const normalizedText = firstPass.normalizedText
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");

    const sections = emptySections();
    let currentSection: SectionKey | null = null;

    for (const line of normalizedText.split("\n")) {
      if (!line) continue;

      const heading = headingFor(line);
      if (heading) {
        currentSection = heading.section;
        if (currentSection && heading.remainder) {
          addLine(sections, currentSection, heading.remainder);
        }
        continue;
      }
      if (currentSection) {
        addLine(sections, currentSection, line);
      }
    }

    // Reuse the canonical array trimming/deduplication and final text checks.
    return normalizeResume({ normalizedText, sections });
  } catch (error) {
    if (error instanceof PersistenceValidationError) {
      throw new ResumeNormalizationError("INVALID_RESUME_TEXT", error.message);
    }
    if (error instanceof ResumeNormalizationError) {
      throw error;
    }
    throw new ResumeNormalizationError(
      "NORMALIZATION_FAILED",
      "Unable to process the resume text.",
    );
  }
}