/**
 * Raised when CareerLM does not have enough current-user information to
 * construct a meaningful external job search.
 *
 * This is an application-level state rather than a provider failure.
 */
export class JobSearchContextRequiredError extends Error {
    readonly code =
      "JOB_SEARCH_CONTEXT_REQUIRED";
  
    readonly statusCode = 400;
  
    constructor() {
      super(
        "CareerLM needs job preferences, a target role, résumé skills, or completed portfolio skills before searching for jobs."
      );
  
      this.name =
        "JobSearchContextRequiredError";
    }
  }