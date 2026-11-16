// SCRUM-268 [S5-M2-05] — server-side job search for the /jobs page.
//
// Saves the form as the current user's job preferences, then asks Member 1's
// CareerDataService.searchJobsForMe() for results. The browser never sends a
// user ID, never calls Jobicy directly, and never sees provider internals:
// every failure is mapped to a short, safe message the page can show.

import { AuthenticationRequiredError } from "@/lib/auth";
import type { JobOpportunity } from "@/lib/jobs/domain";
import {
  JobProviderError,
  JobProviderRateLimitError,
} from "@/lib/jobs/provider-errors";
import {
  EMPTY_JOB_SEARCH_FORM,
  readJobSearchForm,
  validateJobSearchForm,
  type JobSearchFieldErrors,
  type JobSearchFormValues,
} from "@/lib/jobSearchForm";
import type { CareerDataService } from "@/lib/services";
import { JobSearchContextRequiredError } from "@/lib/services/job-search-errors";

/** Results requested per search; Member 1's default is also 20. */
export const JOB_RESULTS_LIMIT = 20;

export type JobSearchFailureKind =
  | "validation"
  | "needs-context"
  | "signed-out"
  | "rate-limited"
  | "unavailable";

export type JobSearchResult =
  | { ok: true; jobs: JobOpportunity[] }
  | {
      ok: false;
      kind: JobSearchFailureKind;
      title: string;
      message: string;
      /** True when trying the same search again could succeed. */
      retryable: boolean;
      fieldErrors?: JobSearchFieldErrors;
    };

type JobSearchService = Pick<CareerDataService, "saveMyJobPreferences" | "searchJobsForMe">;

type JobSearchLoadService = Pick<
  CareerDataService,
  "getMyJobPreferences" | "getMyJobSearchContext"
>;

export interface JobSearchPageData {
  initialValues: JobSearchFormValues;
  hasSavedPreferences: boolean;
}

function failure(
  kind: JobSearchFailureKind,
  title: string,
  message: string,
  retryable: boolean,
  fieldErrors?: JobSearchFieldErrors,
): JobSearchResult {
  return fieldErrors
    ? { ok: false, kind, title, message, retryable, fieldErrors }
    : { ok: false, kind, title, message, retryable };
}

function mapError(error: unknown): JobSearchResult {
  if (error instanceof AuthenticationRequiredError) {
    return failure(
      "signed-out",
      "Please log in again",
      "Your session has ended. Log in again to search for jobs.",
      false,
    );
  }

  if (error instanceof JobSearchContextRequiredError) {
    return failure(
      "needs-context",
      "Tell us what you're looking for",
      "Add keywords, or finish the questionnaire so CareerLM knows your target role.",
      false,
    );
  }

  if (error instanceof JobProviderRateLimitError) {
    return failure(
      "rate-limited",
      "Too many searches",
      "The job listing service is busy. Wait a minute, then try again.",
      true,
    );
  }

  if (error instanceof JobProviderError) {
    return failure(
      "unavailable",
      "Job listings are unavailable",
      "We couldn't reach the job listing service. Try again in a moment.",
      true,
    );
  }

  return failure(
    "unavailable",
    "Something went wrong",
    "We couldn't search for jobs right now. Try again in a moment.",
    true,
  );
}

export async function runJobSearch(
  service: JobSearchService,
  raw: unknown,
): Promise<JobSearchResult> {
  const values = readJobSearchForm(raw);
  const fieldErrors = validateJobSearchForm(values);

  if (Object.keys(fieldErrors).length > 0) {
    return failure(
      "validation",
      "Check your search",
      "Some fields need attention.",
      false,
      fieldErrors,
    );
  }

  try {
    await service.saveMyJobPreferences({
      keywords: values.keywords,
      location: values.location || undefined,
      workplaceTypes: values.workplaceTypes,
      employmentTypes: values.employmentTypes,
      experienceLevels: values.experienceLevels,
      useResumeForMatching: values.useResumeForMatching,
      usePortfolioForMatching: values.usePortfolioForMatching,
    });

    const jobs = await service.searchJobsForMe({ limit: JOB_RESULTS_LIMIT });
    return { ok: true, jobs };
  } catch (error) {
    return mapError(error);
  }
}

/**
 * Initial form values: the user's saved preferences if they have any,
 * otherwise suggestions from their questionnaire/profile (target role as
 * keywords). Never throws; falls back to an empty form.
 */
export async function loadJobSearchPage(
  service: JobSearchLoadService,
): Promise<JobSearchPageData> {
  try {
    const saved = await service.getMyJobPreferences();

    if (saved) {
      return {
        hasSavedPreferences: true,
        initialValues: readJobSearchForm({ ...saved, location: saved.location ?? "" }),
      };
    }
  } catch {
    // Fall through to suggestions.
  }

  try {
    const context = await service.getMyJobSearchContext();

    return {
      hasSavedPreferences: false,
      initialValues: readJobSearchForm({
        ...EMPTY_JOB_SEARCH_FORM,
        keywords: context.keywords ?? context.targetRole ?? "",
        location: context.location ?? "",
        workplaceTypes: context.workplaceTypes,
        employmentTypes: context.employmentTypes,
        experienceLevels: context.experienceLevels,
      }),
    };
  } catch {
    return { hasSavedPreferences: false, initialValues: EMPTY_JOB_SEARCH_FORM };
  }
}
