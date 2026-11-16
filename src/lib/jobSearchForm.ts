// SCRUM-265 [S5-M2-02] — job search form rules shared by the browser and
// the server action, so both apply exactly the same checks.
//
// The form edits the current user's saved job preferences (Member 1's
// JobPreferencesInput). Member 1's persistence validation remains the
// authoritative check; these are usability guards for the /jobs page.

import type {
  JobEmploymentType,
  JobExperienceLevel,
  JobWorkplaceType,
} from "@/lib/jobs/domain";
import { MAX_JOB_LOCATION_LENGTH, MAX_JOB_QUERY_LENGTH } from "@/lib/jobs/validation";

export interface JobSearchFormValues {
  keywords: string;
  location: string;
  workplaceTypes: JobWorkplaceType[];
  employmentTypes: JobEmploymentType[];
  experienceLevels: JobExperienceLevel[];
  useResumeForMatching: boolean;
  usePortfolioForMatching: boolean;
}

export type JobSearchField = "keywords" | "location";

export type JobSearchFieldErrors = Partial<Record<JobSearchField, string>>;

export const MAX_KEYWORDS_LENGTH = MAX_JOB_QUERY_LENGTH;
export const MAX_LOCATION_LENGTH = MAX_JOB_LOCATION_LENGTH;

export const WORKPLACE_OPTIONS: ReadonlyArray<{ value: JobWorkplaceType; label: string }> = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on-site", label: "On-site" },
];

export const EMPLOYMENT_OPTIONS: ReadonlyArray<{ value: JobEmploymentType; label: string }> = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

export const EXPERIENCE_OPTIONS: ReadonlyArray<{ value: JobExperienceLevel; label: string }> = [
  { value: "entry", label: "Entry level" },
  { value: "mid", label: "Mid level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

export const EMPTY_JOB_SEARCH_FORM: JobSearchFormValues = {
  keywords: "",
  location: "",
  workplaceTypes: [],
  employmentTypes: [],
  experienceLevels: [],
  useResumeForMatching: false,
  usePortfolioForMatching: false,
};

function pickAllowed<T extends string>(
  value: unknown,
  options: ReadonlyArray<{ value: T }>,
): T[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const allowed = new Set(options.map((option) => option.value));
  const picked = value.filter((item): item is T => allowed.has(item as T));
  return [...new Set(picked)];
}

/**
 * Turns untrusted form data into well-formed values: trimmed strings, only
 * known option values, real booleans. Anything else is dropped.
 */
export function readJobSearchForm(raw: unknown): JobSearchFormValues {
  const input = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;

  return {
    keywords: typeof input.keywords === "string" ? input.keywords.trim() : "",
    location: typeof input.location === "string" ? input.location.trim() : "",
    workplaceTypes: pickAllowed(input.workplaceTypes, WORKPLACE_OPTIONS),
    employmentTypes: pickAllowed(input.employmentTypes, EMPLOYMENT_OPTIONS),
    experienceLevels: pickAllowed(input.experienceLevels, EXPERIENCE_OPTIONS),
    useResumeForMatching: input.useResumeForMatching === true,
    usePortfolioForMatching: input.usePortfolioForMatching === true,
  };
}

export function validateJobSearchForm(values: JobSearchFormValues): JobSearchFieldErrors {
  const errors: JobSearchFieldErrors = {};
  const keywords = values.keywords.trim();
  const location = values.location.trim();

  if (!keywords) {
    errors.keywords = "Enter a job title or keywords to search for.";
  } else if (keywords.length > MAX_KEYWORDS_LENGTH) {
    errors.keywords = `Keywords must be ${MAX_KEYWORDS_LENGTH} characters or fewer.`;
  }

  if (location.length > MAX_LOCATION_LENGTH) {
    errors.location = `Location must be ${MAX_LOCATION_LENGTH} characters or fewer.`;
  }

  return errors;
}
