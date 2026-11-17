/* @vitest-environment node */

import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";

import type { CurrentUserProvider } from "@/lib/auth/current-user-provider";
import { AuthenticationRequiredError } from "@/lib/auth/errors";
import { InMemoryCareerRepository } from "@/lib/persistence/in-memory-repository";
import { CareerDataService } from "@/lib/services/career-data-service";
import {
  ResumeExtractionError,
  type ValidatedResumeSource,
} from "@/lib/services/resume-extraction";
import { processAndSaveResume } from "@/lib/services/resume-handoff";

// All data in these tests is synthetic.
const COMPLETE_RESUME = [
  "John Doe",
  "Education",
  "B.S. Computer Science",
  "Experience",
  "Software Engineer at Example Co.",
  "Technical Skills",
  "TypeScript, React, Node.js",
  "Projects",
  "CareerLM - Career development platform",
].join("\n");

const EXPECTED_SECTIONS = {
  education: ["B.S. Computer Science"],
  experience: ["Software Engineer at Example Co."],
  skills: ["TypeScript", "React", "Node.js"],
  projects: ["CareerLM - Career development platform"],
};

function textSource(text: string): ValidatedResumeSource {
  return { kind: "text", text };
}

// The same constructor and current-user abstraction used in CareerDataService tests.
function serviceFor(
  repository: InMemoryCareerRepository,
  userId: string | null = "test-user",
): CareerDataService {
  const currentUserProvider: CurrentUserProvider = {
    getCurrentUser: async () => (userId === null ? null : { id: userId }),
  };
  return new CareerDataService(repository, currentUserProvider);
}

describe("S4-M3-03: resume processing and persistence handoff", () => {
  it("processes and saves all four sections of a plain-text resume", async () => {
    const repository = new InMemoryCareerRepository();
    const service = serviceFor(repository);
    const saveMyResume = vi.spyOn(service, "saveMyResume");

    const saved = await processAndSaveResume(textSource(COMPLETE_RESUME), service);

    expect(saved.sections).toEqual(EXPECTED_SECTIONS);
    expect(saved.userId).toBe("test-user");
    expect(saved.schemaVersion).toBe(1);
    expect(saveMyResume).toHaveBeenCalledTimes(1);
    expect(saveMyResume.mock.calls[0]).toHaveLength(1);
    expect(saveMyResume).toHaveBeenCalledWith({
      normalizedText: COMPLETE_RESUME,
      sections: EXPECTED_SECTIONS,
    });
    expect(await repository.getResume("test-user")).toEqual(saved);
  });

  it("retrieves the same normalized data and sections after saving", async () => {
    const repository = new InMemoryCareerRepository();
    const service = serviceFor(repository);

    const saved = await processAndSaveResume(textSource(COMPLETE_RESUME), service);
    const retrieved = await service.getMyResume();

    expect(retrieved).toEqual(saved);
    expect(retrieved?.sections).toEqual(EXPECTED_SECTIONS);
    expect(retrieved?.normalizedText).toBe(COMPLETE_RESUME);
  });

  it("extracts a synthetic PDF and saves its normalized text", async () => {
    const repository = new InMemoryCareerRepository();
    const service = serviceFor(repository);
    // Reuses the same fixture as resume-extraction.test.ts.
    const bytes = await readFile(
      new URL("../fixtures/sample-resume.pdf", import.meta.url),
    );

    const saved = await processAndSaveResume({ kind: "pdf", bytes }, service);

    expect(saved.normalizedText).toMatch(/python/i);
    expect(saved.userId).toBe("test-user");
    expect(await service.getMyResume()).toEqual(saved);
  });

  it("works without any analysis service", async () => {
    const repository = new InMemoryCareerRepository();
    const service = serviceFor(repository);

    // The handoff receives only a source and the persistence service.
    const saved = await processAndSaveResume(textSource(COMPLETE_RESUME), service);

    expect(saved.sections).toEqual(EXPECTED_SECTIONS);
    expect(await service.getMyResume()).toEqual(saved);
  });

  it("allows a missing education section without crashing", async () => {
    const service = serviceFor(new InMemoryCareerRepository());
    const saved = await processAndSaveResume(
      textSource("Experience\nDeveloper\nSkills\nSQL\nProjects\nExample App"),
      service,
    );

    expect(saved.sections).toEqual({
      education: [],
      experience: ["Developer"],
      skills: ["SQL"],
      projects: ["Example App"],
    });
  });

  it("does not save when PDF extraction fails", async () => {
    const repository = new InMemoryCareerRepository();
    const service = serviceFor(repository);
    const saveMyResume = vi.spyOn(service, "saveMyResume");
    // Invalid bytes simulate a corrupted PDF reaching the extraction boundary.
    const operation = processAndSaveResume(
      { kind: "pdf", bytes: new Uint8Array([1, 2, 3, 4]) },
      service,
    );

    await expect(operation).rejects.toBeInstanceOf(ResumeExtractionError);
    await expect(operation).rejects.toMatchObject({ code: "EXTRACTION_FAILED" });
    expect(saveMyResume).not.toHaveBeenCalled();
    expect(await repository.getResume("test-user")).toBeNull();
  });

  it("rejects saving without a current user and writes nothing", async () => {
    const repository = new InMemoryCareerRepository();
    const service = serviceFor(repository, null);
    const saveResume = vi.spyOn(repository, "saveResume");

    await expect(
      processAndSaveResume(textSource(COMPLETE_RESUME), service),
    ).rejects.toBeInstanceOf(AuthenticationRequiredError);

    expect(saveResume).not.toHaveBeenCalled();
    expect(await repository.getResume("test-user")).toBeNull();
  });

  it("keeps resumes isolated between two current users", async () => {
    const repository = new InMemoryCareerRepository();
    const userA = serviceFor(repository, "user-a");
    const userB = serviceFor(repository, "user-b");

    const savedA = await processAndSaveResume(textSource(COMPLETE_RESUME), userA);
    expect(await userB.getMyResume()).toBeNull();

    const savedB = await processAndSaveResume(
      textSource("Skills\nPython\nProjects\nUser B App"),
      userB,
    );

    expect(savedA.userId).toBe("user-a");
    expect(savedB.userId).toBe("user-b");
    expect((await userA.getMyResume())?.sections.skills).toEqual([
      "TypeScript", "React", "Node.js",
    ]);
    expect((await userB.getMyResume())?.sections.skills).toEqual(["Python"]);
    expect(await repository.getResume("user-a")).toEqual(savedA);
    expect(await repository.getResume("user-b")).toEqual(savedB);
  });

  it("rejects when repository saving fails and stores no record", async () => {
    const repository = new InMemoryCareerRepository();
    const service = serviceFor(repository);
    const saveResume = vi.spyOn(repository, "saveResume")
      .mockRejectedValue(new Error("Synthetic storage failure"));

    await expect(
      processAndSaveResume(textSource(COMPLETE_RESUME), service),
    ).rejects.toThrow("Synthetic storage failure");

    expect(saveResume).toHaveBeenCalledTimes(1);
    expect(await repository.getResume("test-user")).toBeNull();
  });

  it("replaces a previously saved resume for the same user", async () => {
    const repository = new InMemoryCareerRepository();
    const service = serviceFor(repository);

    const original = await processAndSaveResume(textSource(COMPLETE_RESUME), service);
    const replacement = await processAndSaveResume(
      textSource("Skills\nGo, SQL\nProjects\nNew Resume Matcher"),
      service,
    );

    expect(replacement.sections.skills).toEqual(["Go", "SQL"]);
    expect(replacement.sections.projects).toEqual(["New Resume Matcher"]);
    expect(replacement.normalizedText).not.toBe(original.normalizedText);
    expect(replacement.createdAt).toBe(original.createdAt);
    expect(await service.getMyResume()).toEqual(replacement);
  });

  it("does not save when resume text is unreadable", async () => {
    const saveMyResume = vi.fn();

    const operation = processAndSaveResume(
      { kind: "text", text: "   \n\t  " },
      { saveMyResume },
    );

    await expect(operation).rejects.toMatchObject({
      code: "UNREADABLE_RESUME",
    });

    expect(saveMyResume).not.toHaveBeenCalled();
  });

});