import type {
    JobOpportunity,
    JobSearchQuery,
  } from "./domain";
  
  /**
   * HTTP function used by external job providers.
   *
   * The type is intentionally injectable so automated tests can provide a
   * deterministic implementation without making live network requests.
   */
  export type JobProviderFetch = (
    input: string | URL,
    init?: RequestInit
  ) => Promise<Response>;
  
  /**
   * Provider-independent external job-search boundary.
   *
   * CareerLM application code should depend on this interface rather than a
   * provider-specific implementation such as JobicyJobProvider.
   */
  export interface JobProvider {
    /**
     * Searches an external job source using CareerLM's normalized search
     * contract and returns CareerLM-owned job opportunities.
     */
    searchJobs(
      query: JobSearchQuery
    ): Promise<JobOpportunity[]>;
  }