// @vitest-environment node

// SCRUM-265 / SCRUM-268 / SCRUM-164 — server-side job search tests.
// The job provider is always a fake; no live Jobicy request is made.

import { describe, expect, it, vi } from "vitest";

import { AuthenticationRequiredError } from "@/lib/auth";
import { FULL_JOB, MINIMAL_JOB } from "@/lib/fixtures/jobs";
import type { JobProvider } from "@/lib/jobs/provider";
import {
  JobProviderMalformedResponseError,
  JobProviderRateLimitError,
  JobProviderTimeoutError,
  JobProviderUnavailableError,
} from "@/lib/jobs/provider-errors";
import { InMemoryCareerRepository } from "@/lib/persistence/in-memory-repository";
import { createDefaultCareerDataService } from "@/lib/services";
import { JobSearchContextRequiredError } from "@/lib/services/job-search-errors";

import { JOB_RESULTS_LIMIT, loadJobSearchPage, runJobSearch } from "./jobSearch";
import { readJobSearchForm, validateJobSearchForm } from "./jobSearchForm";

const FORM = {
  keywords: "Software Engineer",
  location: "Remote",
  workplaceTypes: ["remote"],
  employmentTypes: ["full-time"],
  experienceLevels: ["entry"],
  useResumeForMatching: true,
  usePortfolioForMatching: false,
};

function fakeProvider(result: Awaited<ReturnType<JobProvider["searchJobs"]>> | Error) {
  const searchJobs = vi.fn<JobProvider["searchJobs"]>(async () => {
    if (result instanceof Error) throw result;
    return result;
  });
  return { provider: { searchJobs } as unknown as JobProvider, searchJobs };
}

function serviceFor(userId: string | null, provider: JobProvider, repository = new InMemoryCareerRepository()) {
  return createDefaultCareerDataService({
    repository,
    currentUserProvider: { getCurrentUser: async () => (userId ? { id: userId } : null) },
    jobProvider: provider,
  });
}

describe("readJobSearchForm and validateJobSearchForm", () => {
  it("trims text and keeps only known option values", () => {
    const values = readJobSearchForm({
      ...FORM,
      keywords: "  Data Analyst  ",
      workplaceTypes: ["remote", "moon-base", "remote"],
      experienceLevels: ["entry", 42],
      useResumeForMatching: "yes",
    });

    expect(values.keywords).toBe("Data Analyst");
    expect(values.workplaceTypes).toEqual(["remote"]);
    expect(values.experienceLevels).toEqual(["entry"]);
    expect(values.useResumeForMatching).toBe(false);
  });

  it("treats non-object input as an empty form", () => {
    expect(readJobSearchForm(null).keywords).toBe("");
    expect(readJobSearchForm("keywords=x").workplaceTypes).toEqual([]);
  });

  it.each([
    ["missing keywords", { keywords: "   " }, "keywords"],
    ["keywords over 200 characters", { keywords: "a".repeat(201) }, "keywords"],
    ["location over 200 characters", { location: "b".repeat(201) }, "location"],
  ])("rejects %s", (_label, change, field) => {
    const errors = validateJobSearchForm(readJobSearchForm({ ...FORM, ...change }));

    expect(errors[field as "keywords" | "location"]).toBeTruthy();
  });

  it("accepts keywords and location at exactly 200 characters", () => {
    const errors = validateJobSearchForm(
      readJobSearchForm({ ...FORM, keywords: "a".repeat(200), location: "b".repeat(200) }),
    );

    expect(errors).toEqual({});
  });
});

describe("runJobSearch", () => {
  it("saves the preferences for the current user, then returns jobs", async () => {
    const { provider, searchJobs } = fakeProvider([FULL_JOB, MINIMAL_JOB]);
    const service = serviceFor("test-user-a", provider);

    const result = await runJobSearch(service, FORM);

    expect(result).toEqual({ ok: true, jobs: [FULL_JOB, MINIMAL_JOB] });
    expect(await service.getMyJobPreferences()).toMatchObject({
      keywords: "Software Engineer",
      location: "Remote",
      workplaceTypes: ["remote"],
      useResumeForMatching: true,
    });
    expect(searchJobs).toHaveBeenCalledTimes(1);
    expect(searchJobs.mock.calls[0][0]).toMatchObject({
      keywords: "Software Engineer",
      limit: JOB_RESULTS_LIMIT,
    });
  });

  it("returns an empty list when nothing matches", async () => {
    const { provider } = fakeProvider([]);

    expect(await runJobSearch(serviceFor("test-user-a", provider), FORM)).toEqual({ ok: true, jobs: [] });
  });

  it("returns field errors and neither saves nor searches when keywords are empty", async () => {
    const { provider, searchJobs } = fakeProvider([FULL_JOB]);
    const service = serviceFor("test-user-a", provider);

    const result = await runJobSearch(service, { ...FORM, keywords: "" });

    expect(result).toMatchObject({ ok: false, kind: "validation", fieldErrors: { keywords: expect.any(String) } });
    expect(searchJobs).not.toHaveBeenCalled();
    expect(await service.getMyJobPreferences()).toBeNull();
  });

  it("keeps each user's saved preferences separate", async () => {
    const repository = new InMemoryCareerRepository();
    const { provider } = fakeProvider([]);

    await runJobSearch(serviceFor("test-user-a", provider, repository), FORM);

    expect(await serviceFor("test-user-b", provider, repository).getMyJobPreferences()).toBeNull();
  });

  it.each([
    ["signed out", null, null, "signed-out", false],
    ["rate limited", "test-user-a", new JobProviderRateLimitError(), "rate-limited", true],
    ["provider unavailable", "test-user-a", new JobProviderUnavailableError(), "unavailable", true],
    ["provider timeout", "test-user-a", new JobProviderTimeoutError(), "unavailable", true],
    ["malformed provider response", "test-user-a", new JobProviderMalformedResponseError(), "unavailable", true],
    ["unexpected error", "test-user-a", new Error("socket hang up at 10.0.0.5"), "unavailable", true],
  ])("maps %s to a safe message", async (_label, userId, error, kind, retryable) => {
    const { provider } = fakeProvider(error ?? []);

    const result = await runJobSearch(serviceFor(userId, provider), FORM);

    expect(result).toMatchObject({ ok: false, kind, retryable });
    expect(JSON.stringify(result)).not.toContain("10.0.0.5");
  });

  it("maps a missing search context to needs-context", async () => {
    const service = {
      saveMyJobPreferences: vi.fn(async () => ({}) as never),
      searchJobsForMe: vi.fn(async () => {
        throw new JobSearchContextRequiredError();
      }),
    };

    expect(await runJobSearch(service, FORM)).toMatchObject({ ok: false, kind: "needs-context", retryable: false });
  });

  it("reports signed-out when saving preferences needs a login", async () => {
    const service = {
      saveMyJobPreferences: vi.fn(async () => {
        throw new AuthenticationRequiredError();
      }),
      searchJobsForMe: vi.fn(),
    };

    expect(await runJobSearch(service, FORM)).toMatchObject({ ok: false, kind: "signed-out" });
    expect(service.searchJobsForMe).not.toHaveBeenCalled();
  });
});

describe("loadJobSearchPage", () => {
  it("prefills the form from saved preferences", async () => {
    const { provider } = fakeProvider([]);
    const service = serviceFor("test-user-a", provider);
    await runJobSearch(service, FORM);

    const page = await loadJobSearchPage(service);

    expect(page.hasSavedPreferences).toBe(true);
    expect(page.initialValues).toMatchObject({ keywords: "Software Engineer", location: "Remote" });
  });

  it("suggests the questionnaire target role when nothing is saved", async () => {
    const { provider } = fakeProvider([]);
    const service = serviceFor("test-user-a", provider);
    await service.saveMyQuestionnaire({
      targetRole: "Data Analyst",
      experienceLevel: "beginner",
      existingSkills: ["SQL"],
      learningStyle: "Hands-on projects",
      weeklyHours: 8,
    });

    const page = await loadJobSearchPage(service);

    expect(page.hasSavedPreferences).toBe(false);
    expect(page.initialValues.keywords).toBe("Data Analyst");
  });

  it("falls back to an empty form when loading fails", async () => {
    const page = await loadJobSearchPage({
      getMyJobPreferences: async () => {
        throw new Error("db down");
      },
      getMyJobSearchContext: async () => {
        throw new Error("db down");
      },
    });

    expect(page).toMatchObject({ hasSavedPreferences: false, initialValues: { keywords: "" } });
  });
});
