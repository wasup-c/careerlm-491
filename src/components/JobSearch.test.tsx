// SCRUM-164 [S5-M2-TEST] — job search form and results tests.
// Uses synthetic fixtures and a fake search function; no live provider.

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FULL_JOB, LONG_TEXT_JOB, MINIMAL_JOB } from "@/lib/fixtures/jobs";
import type { JobSearchResult } from "@/lib/jobSearch";
import { EMPTY_JOB_SEARCH_FORM, type JobSearchFormValues } from "@/lib/jobSearchForm";

import JobSearch from "./JobSearch";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

const PREFILLED: JobSearchFormValues = { ...EMPTY_JOB_SEARCH_FORM, keywords: "Software Engineer" };

const UNAVAILABLE: JobSearchResult = {
  ok: false,
  kind: "unavailable",
  title: "Job listings are unavailable",
  message: "We couldn't reach the job listing service. Try again in a moment.",
  retryable: true,
};

function renderSearch(
  onSearch: (values: JobSearchFormValues) => Promise<JobSearchResult> = vi.fn(
    async (): Promise<JobSearchResult> => ({ ok: true, jobs: [FULL_JOB, MINIMAL_JOB] }),
  ),
  initialValues: JobSearchFormValues = PREFILLED,
  hasSavedPreferences = false,
) {
  render(
    <JobSearch initialValues={initialValues} hasSavedPreferences={hasSavedPreferences} onSearch={onSearch} />,
  );
  return { onSearch, keywords: screen.getByLabelText("Job title or keywords") };
}

beforeEach(() => push.mockReset());

describe("JobSearch form", () => {
  it("prefills the form and starts in the idle state without searching", () => {
    const { onSearch, keywords } = renderSearch();

    expect(keywords).toHaveValue("Software Engineer");
    expect(screen.getByText("Suggested from your profile. Saved when you search.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ready when you are" })).toBeInTheDocument();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("says when the values came from saved preferences", () => {
    renderSearch(undefined, PREFILLED, true);

    expect(screen.getByText("Loaded from your saved preferences.")).toBeInTheDocument();
  });

  it("groups each filter under a labeled fieldset", () => {
    renderSearch();

    for (const legend of ["Work setup", "Job type", "Experience level", "Use for matching"]) {
      expect(screen.getByRole("group", { name: legend })).toBeInTheDocument();
    }
    expect(screen.getByRole("checkbox", { name: "Remote" })).not.toBeChecked();
  });

  it("blocks an empty search, ties the error to the field and focuses it", async () => {
    const { onSearch } = renderSearch(undefined, EMPTY_JOB_SEARCH_FORM);
    const keywords = screen.getByLabelText("Job title or keywords");

    await userEvent.click(screen.getByRole("button", { name: "Search jobs" }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(keywords).toHaveAttribute("aria-invalid", "true");
    expect(keywords).toHaveAccessibleDescription(/Enter a job title or keywords to search for\./);
    expect(keywords).toHaveFocus();
  });

  it("sends the chosen filters (equivalence classes: keywords only, plus each filter type)", async () => {
    const { onSearch, keywords } = renderSearch();

    await userEvent.clear(keywords);
    await userEvent.type(keywords, "Frontend Developer");
    await userEvent.type(screen.getByLabelText(/Location/), "Los Angeles");
    await userEvent.click(screen.getByRole("checkbox", { name: "Remote" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Internship" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Entry level" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "My saved résumé" }));
    await userEvent.click(screen.getByRole("button", { name: "Search jobs" }));

    expect(onSearch).toHaveBeenCalledWith({
      keywords: "Frontend Developer",
      location: "Los Angeles",
      workplaceTypes: ["remote"],
      employmentTypes: ["internship"],
      experienceLevels: ["entry"],
      useResumeForMatching: true,
      usePortfolioForMatching: false,
    });
  });

  it("unchecks a filter when clicked twice", async () => {
    const { onSearch } = renderSearch();
    const remote = screen.getByRole("checkbox", { name: "Remote" });

    await userEvent.click(remote);
    await userEvent.click(remote);
    await userEvent.click(screen.getByRole("button", { name: "Search jobs" }));

    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ workplaceTypes: [] }));
  });

  it("can be searched using only the keyboard", async () => {
    const { onSearch, keywords } = renderSearch();

    keywords.focus();
    await userEvent.keyboard("{Enter}");

    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});

describe("JobSearch results states", () => {
  it("goes idle → loading → success, showing cards and focusing the results heading", async () => {
    let finish: (result: JobSearchResult) => void = () => {};
    const onSearch = vi.fn(() => new Promise<JobSearchResult>((resolve) => (finish = resolve)));
    renderSearch(onSearch);

    await userEvent.click(screen.getByRole("button", { name: "Search jobs" }));

    expect(screen.getByRole("button", { name: "Searching…" })).toBeDisabled();
    expect(screen.getByRole("region", { name: "Job results" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("heading", { name: "Searching for jobs…" })).toBeInTheDocument();

    await act(async () => finish({ ok: true, jobs: [FULL_JOB, MINIMAL_JOB, LONG_TEXT_JOB] }));

    const heading = screen.getByRole("heading", { name: "3 jobs found" });
    expect(heading).toHaveFocus();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByRole("region", { name: "Job results" })).toHaveAttribute("aria-busy", "false");
  });

  it("uses the singular for one result", async () => {
    renderSearch(vi.fn(async (): Promise<JobSearchResult> => ({ ok: true, jobs: [FULL_JOB] })));

    await userEvent.click(screen.getByRole("button", { name: "Search jobs" }));

    expect(await screen.findByRole("heading", { name: "1 job found" })).toBeInTheDocument();
  });

  it("prevents a second search while one is running", async () => {
    const onSearch = vi.fn(() => new Promise<JobSearchResult>(() => {}));
    renderSearch(onSearch);

    await userEvent.click(screen.getByRole("button", { name: "Search jobs" }));
    fireEvent.submit(screen.getByRole("button", { name: "Searching…" }).closest("form")!);

    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it("shows a clear empty state when nothing matches", async () => {
    renderSearch(vi.fn(async (): Promise<JobSearchResult> => ({ ok: true, jobs: [] })));

    await userEvent.click(screen.getByRole("button", { name: "Search jobs" }));

    expect(await screen.findByRole("heading", { name: "No jobs found" })).toHaveFocus();
    expect(screen.getByText(/Try different keywords/)).toBeInTheDocument();
  });

  it("shows a service failure as an alert, then retries the same search", async () => {
    const onSearch = vi
      .fn<(values: JobSearchFormValues) => Promise<JobSearchResult>>()
      .mockResolvedValueOnce(UNAVAILABLE)
      .mockResolvedValueOnce({ ok: true, jobs: [FULL_JOB] });
    renderSearch(onSearch);

    await userEvent.click(screen.getByRole("button", { name: "Search jobs" }));

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByRole("heading", { name: "Job listings are unavailable" })).toBeInTheDocument();
    expect(screen.getByLabelText("Job title or keywords")).toHaveValue("Software Engineer");

    await userEvent.click(within(alert).getByRole("button", { name: "Try Again" }));

    expect(onSearch).toHaveBeenCalledTimes(2);
    expect(onSearch.mock.calls[1][0]).toEqual(onSearch.mock.calls[0][0]);
    expect(await screen.findByRole("heading", { name: "1 job found" })).toBeInTheDocument();
  });

  it("does not crash when the search request itself throws", async () => {
    renderSearch(vi.fn(async () => {
      throw new Error("network down");
    }));

    await userEvent.click(screen.getByRole("button", { name: "Search jobs" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
  });

  it("sends a signed-out user to the login page", async () => {
    renderSearch(vi.fn(async (): Promise<JobSearchResult> => ({
      ok: false,
      kind: "signed-out",
      title: "Please log in again",
      message: "Your session has ended.",
      retryable: false,
    })));

    await userEvent.click(screen.getByRole("button", { name: "Search jobs" }));
    const alert = await screen.findByRole("alert");

    expect(within(alert).queryByRole("button", { name: "Try Again" })).not.toBeInTheDocument();
    await userEvent.click(within(alert).getByRole("button", { name: "Log in" }));
    expect(push).toHaveBeenCalledWith("/login");
  });

  it("points to the questionnaire when there isn't enough information to search", async () => {
    renderSearch(vi.fn(async (): Promise<JobSearchResult> => ({
      ok: false,
      kind: "needs-context",
      title: "Tell us what you're looking for",
      message: "Add keywords, or finish the questionnaire.",
      retryable: false,
    })));

    await userEvent.click(screen.getByRole("button", { name: "Search jobs" }));
    await userEvent.click(await screen.findByRole("button", { name: "Go to questionnaire" }));

    expect(push).toHaveBeenCalledWith("/onboarding");
  });

  it("shows server field errors on the right field", async () => {
    renderSearch(vi.fn(async (): Promise<JobSearchResult> => ({
      ok: false,
      kind: "validation",
      title: "Check your search",
      message: "Some fields need attention.",
      retryable: false,
      fieldErrors: { location: "Location must be 200 characters or fewer." },
    })));

    await userEvent.click(screen.getByRole("button", { name: "Search jobs" }));

    const location = screen.getByLabelText(/Location/);
    expect(location).toHaveAttribute("aria-invalid", "true");
    expect(location).toHaveAccessibleDescription("Location must be 200 characters or fewer.");
    expect(location).toHaveFocus();
  });
});
