// @vitest-environment node

// [S4-M2] Résumé submission — server-side save/load/delete tests.
// All users and résumé text below are synthetic test data.

import { describe, expect, it, vi } from "vitest";

import { AuthenticationRequiredError, type CurrentUserProvider } from "@/lib/auth";
import { InMemoryCareerRepository } from "@/lib/persistence/in-memory-repository";
import { MAX_RESUME_TEXT_LENGTH, validateResumeText } from "@/lib/resumeLimits";
import { createDefaultCareerDataService } from "@/lib/services";

import { deleteSavedResume, loadSavedResume, saveResumeText } from "./resumeSave";

const RESUME = "Test User A\nSoftware Engineer\nSkills: TypeScript, React, SQL";

function userProvider(id: string | null): CurrentUserProvider {
  return { getCurrentUser: async () => (id ? { id } : null) };
}

function serviceFor(repository: InMemoryCareerRepository, userId: string | null) {
  return createDefaultCareerDataService({
    repository,
    currentUserProvider: userProvider(userId),
  });
}

describe("validateResumeText", () => {
  it.each([
    ["empty text", ""],
    ["whitespace only", "   \n\t "],
  ])("rejects %s", (_label, text) => {
    expect(validateResumeText(text)).toBe("Paste your résumé text before saving.");
  });

  it("accepts text exactly at the 100,000-character limit", () => {
    expect(validateResumeText("a".repeat(MAX_RESUME_TEXT_LENGTH))).toBeUndefined();
  });

  it("rejects text one character over the limit and reports the count", () => {
    const error = validateResumeText("a".repeat(MAX_RESUME_TEXT_LENGTH + 1));

    expect(error).toContain("100,001 / 100,000 characters");
  });

  it("ignores surrounding whitespace when measuring", () => {
    expect(validateResumeText(`  ${"a".repeat(MAX_RESUME_TEXT_LENGTH)}  `)).toBeUndefined();
  });
});

describe("saveResumeText", () => {
  it("saves trimmed text for the current user and returns a summary", async () => {
    const repository = new InMemoryCareerRepository();
    const service = serviceFor(repository, "test-user-a");

    const result = await saveResumeText(service, `  ${RESUME}  `);

    expect(result).toMatchObject({
      ok: true,
      resume: { text: RESUME, characterCount: RESUME.length },
    });
    expect((await service.getMyResume())?.normalizedText).toBe(RESUME);
  });

  
  it("replaces the previous résumé on a second save", async () => {
    const service = serviceFor(
      new InMemoryCareerRepository(),
      "test-user-a"
    );

    const updatedResume = [
      "Skills",
      "Python, SQL",
      "Projects",
      "Updated CareerLM App",
    ].join("\n");

    // Save the original resume.
    const first = await saveResumeText(service, RESUME);
    expect(first.ok).toBe(true);

    // Replace with updated resume.
    const second = await saveResumeText(
      service,
      updatedResume
    );

    expect(second.ok).toBe(true);

    // Verify the replacement was saved.
    expect(
      (await loadSavedResume(service))?.text
    ).toBe(updatedResume);
  });


  it("returns a field error and saves nothing for empty or oversized text", async () => {
    const service = serviceFor(new InMemoryCareerRepository(), "test-user-a");
    const saveMyResume = vi.spyOn(service, "saveMyResume");

    const empty = await saveResumeText(service, "  ");
    const oversized = await saveResumeText(service, "a".repeat(MAX_RESUME_TEXT_LENGTH + 1));
    const nonString = await saveResumeText(service, { text: RESUME });

    for (const result of [empty, oversized, nonString]) {
      expect(result).toMatchObject({ ok: false, fieldError: expect.any(String) });
    }
    expect(saveMyResume).not.toHaveBeenCalled();
  });

  it("asks the user to sign in again when there is no current user", async () => {
    const service = serviceFor(new InMemoryCareerRepository(), null);

    const result = await saveResumeText(service, RESUME);

    expect(result).toEqual({
      ok: false,
      message: "Your session has ended. Please sign in again to save your résumé.",
    });
  });

  it("returns a safe message that never repeats résumé text when storage fails", async () => {
    const service = serviceFor(new InMemoryCareerRepository(), "test-user-a");
    vi.spyOn(service, "saveMyResume").mockRejectedValue(
      new Error(`disk full while writing ${RESUME}`),
    );

    const result = await saveResumeText(service, RESUME);

    expect(result.ok).toBe(false);
    expect(JSON.stringify(result)).not.toContain("TypeScript, React");
    expect(JSON.stringify(result)).not.toContain("disk full");
  });

  it("keeps two users' résumés separate", async () => {
    const repository = new InMemoryCareerRepository();
    const userA = serviceFor(repository, "test-user-a");
    const userB = serviceFor(repository, "test-user-b");

    await saveResumeText(userA, RESUME);

    expect(await loadSavedResume(userB)).toBeNull();
    expect((await loadSavedResume(userA))?.text).toBe(RESUME);
  });

  it("does not save text without resume sections", async () => {
    // Arrange
    const service = serviceFor(
      new InMemoryCareerRepository(),
      "test-user-a"
    );

    const saveMyResume = vi.spyOn(service, "saveMyResume");

    const invalidText =
      "Hello, this is just random text for testing.";

    // Act
    const result = await saveResumeText(service, invalidText);

    // Assert
    expect(result).toMatchObject({
      ok: false,
      message: "Your résumé needs attention.",
      fieldError: expect.stringContaining(
        "at least one populated section"
      ),
    });

    // Verify invalid text never reaches persistence.
    expect(saveMyResume).not.toHaveBeenCalled();

    // Verify no resume was saved.
    expect(await service.getMyResume()).toBeNull();
  });

  it("preserves an existing resume when replacement text is invalid", async () => {
    const service = serviceFor(
      new InMemoryCareerRepository(),
      "test-user-a"
    );

    // Save a valid resume first.
    const original = await saveResumeText(service, RESUME);

    expect(original.ok).toBe(true);

    const savedBefore = await service.getMyResume();

    // Attempt to replace it with unrelated text.
    const result = await saveResumeText(
      service,
      "This is not a resume."
    );

    expect(result.ok).toBe(false);

    // Existing saved resume must remain unchanged.
    expect(await service.getMyResume()).toEqual(
      savedBefore
    );
  });
});

describe("loadSavedResume and deleteSavedResume", () => {
  it("returns null when no résumé is saved", async () => {
    const service = serviceFor(new InMemoryCareerRepository(), "test-user-a");

    expect(await loadSavedResume(service)).toBeNull();
  });

  
  it("deletes only the current user's résumé", async () => {
    // Arrange: Two users share the same repository.
    const repository = new InMemoryCareerRepository();

    const userA = serviceFor(repository, "test-user-a");
    const userB = serviceFor(repository, "test-user-b");

    const userBResume = [
      "User B",
      "Skills",
      "Python, SQL",
      "Projects",
      "User B Career Application",
    ].join("\n");

    // Save valid resumes for both users.
    const savedA = await saveResumeText(userA, RESUME);
    const savedB = await saveResumeText(userB, userBResume);

    // Verify both submissions succeeded.
    expect(savedA.ok).toBe(true);
    expect(savedB.ok).toBe(true);

    // Act: Delete only User A's resume.
    expect(await deleteSavedResume(userA)).toEqual({
      ok: true,
    });

    // Assert: User A's resume was deleted.
    expect(await loadSavedResume(userA)).toBeNull();

    // Assert: User B's resume remains unchanged.
    expect(
      (await loadSavedResume(userB))?.text
    ).toBe(userBResume);
  });


  it("returns friendly messages when delete fails", async () => {
    const signedOut = await deleteSavedResume({
      deleteMyResume: async () => {
        throw new AuthenticationRequiredError();
      },
    });
    const failed = await deleteSavedResume({
      deleteMyResume: async () => {
        throw new Error("storage offline");
      },
    });

    expect(signedOut).toMatchObject({ ok: false, message: expect.stringContaining("sign in") });
    expect(failed).toEqual({ ok: false, message: "We couldn't delete your résumé. Please try again." });
  });
});
