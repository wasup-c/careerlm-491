/**
 * CareerLM-owned job-search domain contracts.
 *
 * These types intentionally do not depend on any external job provider.
 *
 * Provider adapters are responsible for translating their provider-specific
 * payloads into these contracts before data enters CareerLM application
 * logic.
 */

export type JobWorkplaceType =
  | "remote"
  | "hybrid"
  | "on-site"
  | "unspecified";

export type JobEmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "temporary"
  | "internship"
  | "other";

export type JobExperienceLevel =
  | "entry"
  | "mid"
  | "senior"
  | "lead"
  | "executive"
  | "unspecified";

export type JobSalaryInterval =
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year";

export interface JobSalary {
  min?: number;

  max?: number;

  currency?: string;

  interval?: JobSalaryInterval;
}

/**
 * Untrusted/provider-facing representation accepted by CareerLM
 * normalization.
 *
 * Provider adapters may construct this shape before calling
 * normalizeJobOpportunity().
 */
export interface JobOpportunityInput {
  providerJobId: string;

  title: string;

  company: string;

  location?: string;

  workplaceType?: JobWorkplaceType;

  description?: string;

  employmentType?: JobEmploymentType;

  experienceLevel?: JobExperienceLevel;

  skills?: string[];

  salary?: JobSalary;

  applicationUrl: string;

  source: string;

  postedAt?: string;

  retrievedAt?: string;
}

/**
 * Canonical CareerLM representation of one external job opportunity.
 *
 * The rest of the application should depend on this contract instead of
 * provider-specific response types.
 */
export interface JobOpportunity {
  providerJobId: string;

  title: string;

  company: string;

  location?: string;

  workplaceType: JobWorkplaceType;

  description?: string;

  employmentType?: JobEmploymentType;

  experienceLevel?: JobExperienceLevel;

  skills: string[];

  salary?: JobSalary;

  applicationUrl: string;

  source: string;

  postedAt?: string;

  retrievedAt: string;
}

/**
 * Application-facing job-search request before normalization.
 */
export interface JobSearchQueryInput {
  keywords: string;

  location?: string;

  workplaceTypes?: JobWorkplaceType[];

  employmentTypes?: JobEmploymentType[];

  experienceLevels?: JobExperienceLevel[];

  limit?: number;
}

/**
 * Canonical search query supplied to JobProvider implementations.
 *
 * Arrays and result limits are always normalized so provider adapters do not
 * need to repeat basic application validation.
 */
export interface JobSearchQuery {
  keywords: string;

  location?: string;

  workplaceTypes: JobWorkplaceType[];

  employmentTypes: JobEmploymentType[];

  experienceLevels: JobExperienceLevel[];

  limit: number;
}