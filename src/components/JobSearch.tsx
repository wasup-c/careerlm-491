"use client";

// SCRUM-265 / SCRUM-267 / SCRUM-268 — job search form and results.
//
// States (from the Member 2 testing plan):
//   idle → loading → success | empty | error, and error → retry → loading.
// The form saves the user's job preferences and searches in one step,
// through a server action. A search runs only when the user submits.

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import ErrorState from "@/components/ErrorState";
import JobCard from "@/components/JobCard";
import type { JobOpportunity } from "@/lib/jobs/domain";
import type { JobSearchResult } from "@/lib/jobSearch";
import {
  EMPLOYMENT_OPTIONS,
  EXPERIENCE_OPTIONS,
  MAX_KEYWORDS_LENGTH,
  MAX_LOCATION_LENGTH,
  WORKPLACE_OPTIONS,
  validateJobSearchForm,
  type JobSearchFieldErrors,
  type JobSearchFormValues,
} from "@/lib/jobSearchForm";

interface JobSearchProps {
  initialValues: JobSearchFormValues;
  hasSavedPreferences: boolean;
  onSearch: (values: JobSearchFormValues) => Promise<JobSearchResult>;
}

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; jobs: JobOpportunity[] }
  | { kind: "error"; result: Extract<JobSearchResult, { ok: false }> };

type ArrayField = "workplaceTypes" | "employmentTypes" | "experienceLevels";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600";

const inputClass = (invalid: boolean) =>
  `mt-1 block w-full rounded-md border px-3 py-2 text-slate-900 shadow-sm ${focusRing} ${
    invalid ? "border-red-500" : "border-slate-300"
  }`;

function resultsHeading(count: number): string {
  return count === 1 ? "1 job found" : `${count} jobs found`;
}

function CheckboxGroup<T extends string>({
  legend,
  name,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  name: ArrayField;
  options: ReadonlyArray<{ value: T; label: string }>;
  selected: T[];
  onToggle: (field: ArrayField, value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          return (
            <label key={option.value} htmlFor={id} className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                id={id}
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => onToggle(name, option.value)}
                className={`h-4 w-4 rounded border-slate-300 text-teal-600 ${focusRing}`}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function JobSearch({ initialValues, hasSavedPreferences, onSearch }: JobSearchProps) {
  const router = useRouter();
  const [values, setValues] = useState<JobSearchFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<JobSearchFieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [lastSearch, setLastSearch] = useState<JobSearchFormValues | null>(null);

  const keywordsRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const loading = status.kind === "loading";

  // Move focus to the results heading when a search finishes, so keyboard
  // and screen reader users land on the outcome.
  useEffect(() => {
    if (status.kind === "success") {
      resultsHeadingRef.current?.focus();
    }
  }, [status]);

  function toggle<T extends string>(field: ArrayField, value: T) {
    setValues((current) => {
      const list = current[field] as string[];
      const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      return { ...current, [field]: next };
    });
  }

  async function search(searchValues: JobSearchFormValues) {
    if (loading) {
      return;
    }

    setStatus({ kind: "loading" });
    setLastSearch(searchValues);

    try {
      const result = await onSearch(searchValues);

      if (result.ok) {
        setStatus({ kind: "success", jobs: result.jobs });
        return;
      }

      if (result.kind === "validation" && result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
        setStatus({ kind: "idle" });
        (result.fieldErrors.keywords ? keywordsRef : locationRef).current?.focus();
        return;
      }

      setStatus({ kind: "error", result });
    } catch {
      setStatus({
        kind: "error",
        result: {
          ok: false,
          kind: "unavailable",
          title: "Something went wrong",
          message: "We couldn't search for jobs right now. Try again in a moment.",
          retryable: true,
        },
      });
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateJobSearchForm(values);
    setFieldErrors(errors);

    if (errors.keywords) {
      keywordsRef.current?.focus();
      return;
    }
    if (errors.location) {
      locationRef.current?.focus();
      return;
    }

    void search(values);
  }

  const keywordsDescribedBy = ["keywords-hint", fieldErrors.keywords ? "keywords-error" : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid w-full gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <section
        aria-labelledby="job-search-heading"
        className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 id="job-search-heading" className="text-lg font-semibold text-slate-900">
          Search preferences
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {hasSavedPreferences
            ? "Loaded from your saved preferences."
            : "Suggested from your profile. Saved when you search."}
        </p>

        <form className="mt-5 space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="job-keywords" className="text-sm font-medium text-slate-700">
              Job title or keywords
            </label>
            <p id="keywords-hint" className="text-xs text-slate-500">
              Required, up to {MAX_KEYWORDS_LENGTH} characters.
            </p>
            <input
              id="job-keywords"
              ref={keywordsRef}
              type="text"
              value={values.keywords}
              maxLength={MAX_KEYWORDS_LENGTH}
              onChange={(event) => {
                setValues({ ...values, keywords: event.target.value });
                if (fieldErrors.keywords) setFieldErrors({ ...fieldErrors, keywords: undefined });
              }}
              aria-invalid={fieldErrors.keywords ? true : undefined}
              aria-describedby={keywordsDescribedBy}
              aria-required="true"
              className={inputClass(Boolean(fieldErrors.keywords))}
            />
            {fieldErrors.keywords ? (
              <p id="keywords-error" className="mt-1 text-sm text-red-700">
                {fieldErrors.keywords}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="job-location" className="text-sm font-medium text-slate-700">
              Location <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <input
              id="job-location"
              ref={locationRef}
              type="text"
              value={values.location}
              maxLength={MAX_LOCATION_LENGTH}
              onChange={(event) => {
                setValues({ ...values, location: event.target.value });
                if (fieldErrors.location) setFieldErrors({ ...fieldErrors, location: undefined });
              }}
              aria-invalid={fieldErrors.location ? true : undefined}
              aria-describedby={fieldErrors.location ? "location-error" : undefined}
              className={inputClass(Boolean(fieldErrors.location))}
            />
            {fieldErrors.location ? (
              <p id="location-error" className="mt-1 text-sm text-red-700">
                {fieldErrors.location}
              </p>
            ) : null}
          </div>

          <CheckboxGroup
            legend="Work setup"
            name="workplaceTypes"
            options={WORKPLACE_OPTIONS}
            selected={values.workplaceTypes}
            onToggle={toggle}
          />
          <CheckboxGroup
            legend="Job type"
            name="employmentTypes"
            options={EMPLOYMENT_OPTIONS}
            selected={values.employmentTypes}
            onToggle={toggle}
          />
          <CheckboxGroup
            legend="Experience level"
            name="experienceLevels"
            options={EXPERIENCE_OPTIONS}
            selected={values.experienceLevels}
            onToggle={toggle}
          />

          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Use for matching</legend>
            <div className="mt-2 space-y-2">
              <label htmlFor="use-resume" className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  id="use-resume"
                  type="checkbox"
                  checked={values.useResumeForMatching}
                  onChange={(event) => setValues({ ...values, useResumeForMatching: event.target.checked })}
                  className={`mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 ${focusRing}`}
                />
                My saved résumé
              </label>
              <label htmlFor="use-portfolio" className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  id="use-portfolio"
                  type="checkbox"
                  checked={values.usePortfolioForMatching}
                  onChange={(event) => setValues({ ...values, usePortfolioForMatching: event.target.checked })}
                  className={`mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 ${focusRing}`}
                />
                Skills from my completed milestones
              </label>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-md bg-teal-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
          >
            {loading ? "Searching…" : "Search jobs"}
          </button>
        </form>
      </section>

      <section aria-label="Job results" aria-busy={loading} className="min-w-0">
        {/* Announces each outcome once, without reading the whole list. */}
        <p className="sr-only" aria-live="polite">
          {status.kind === "loading"
            ? "Searching for jobs…"
            : status.kind === "success"
              ? resultsHeading(status.jobs.length)
              : ""}
        </p>

        {status.kind === "idle" ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 id="job-results-heading" className="text-lg font-semibold text-slate-900">
              Ready when you are
            </h2>
            <p className="mt-2 text-slate-600">
              Set your preferences and select <span className="font-medium">Search jobs</span> to see openings.
            </p>
          </div>
        ) : null}

        {status.kind === "loading" ? (
          <div>
            <h2 id="job-results-heading" className="text-lg font-semibold text-slate-900">
              Searching for jobs…
            </h2>
            <ul className="mt-4 grid gap-6 sm:grid-cols-2" aria-hidden="true">
              {[0, 1, 2, 3].map((item) => (
                <li key={item} className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
                  <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
                  <div className="mt-5 h-16 w-full animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
                  <div className="mt-5 h-10 w-24 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {status.kind === "success" && status.jobs.length > 0 ? (
          <div>
            <h2
              id="job-results-heading"
              ref={resultsHeadingRef}
              tabIndex={-1}
              className={`text-lg font-semibold text-slate-900 ${focusRing}`}
            >
              {resultsHeading(status.jobs.length)}
            </h2>
            <ul className="mt-4 grid gap-6 sm:grid-cols-2">
              {status.jobs.map((job) => (
                <li key={`${job.source}-${job.providerJobId}`} className="min-w-0">
                  <JobCard job={job} headingLevel={3} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {status.kind === "success" && status.jobs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <h2
              id="job-results-heading"
              ref={resultsHeadingRef}
              tabIndex={-1}
              className={`text-lg font-semibold text-slate-900 ${focusRing}`}
            >
              No jobs found
            </h2>
            <p className="mt-2 text-slate-600">
              Try different keywords, a broader location, or fewer filters.
            </p>
          </div>
        ) : null}

        {status.kind === "error" ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-white p-8">
            <ErrorState
              title={status.result.title}
              message={status.result.message}
              onRetry={
                status.result.retryable && lastSearch ? () => void search(lastSearch) : undefined
              }
              onNavigate={
                status.result.kind === "signed-out"
                  ? () => router.push("/login")
                  : status.result.kind === "needs-context"
                    ? () => router.push("/onboarding")
                    : undefined
              }
              navigationLabel={
                status.result.kind === "signed-out" ? "Log in" : "Go to questionnaire"
              }
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
