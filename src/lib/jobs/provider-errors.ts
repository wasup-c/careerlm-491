export type JobProviderErrorCode =
  | "JOB_PROVIDER_UNAVAILABLE"
  | "JOB_PROVIDER_RATE_LIMITED"
  | "JOB_PROVIDER_TIMEOUT"
  | "JOB_PROVIDER_MALFORMED_RESPONSE";

/**
 * Base application-level error for external job-provider failures.
 *
 * Provider-specific HTTP bodies, network errors, and implementation details
 * should not escape through this boundary.
 */
export class JobProviderError extends Error {
  constructor(
    message: string,
    readonly code: JobProviderErrorCode,
    readonly statusCode: number
  ) {
    super(message);

    this.name = "JobProviderError";
  }
}

/**
 * Raised when the provider cannot currently service the request.
 */
export class JobProviderUnavailableError extends JobProviderError {
  constructor() {
    super(
      "Job provider is currently unavailable.",
      "JOB_PROVIDER_UNAVAILABLE",
      503
    );

    this.name =
      "JobProviderUnavailableError";
  }
}

/**
 * Raised when the external provider reports that its rate limit has been
 * reached.
 */
export class JobProviderRateLimitError extends JobProviderError {
  constructor() {
    super(
      "Job provider rate limit reached. Please try again later.",
      "JOB_PROVIDER_RATE_LIMITED",
      503
    );

    this.name =
      "JobProviderRateLimitError";
  }
}

/**
 * Raised when a provider request exceeds CareerLM's configured timeout.
 */
export class JobProviderTimeoutError extends JobProviderError {
  constructor() {
    super(
      "Job provider request timed out.",
      "JOB_PROVIDER_TIMEOUT",
      504
    );

    this.name =
      "JobProviderTimeoutError";
  }
}

/**
 * Raised when the provider returns data that cannot safely be normalized
 * into CareerLM's job-domain contracts.
 */
export class JobProviderMalformedResponseError extends JobProviderError {
  constructor() {
    super(
      "Job provider returned an invalid response.",
      "JOB_PROVIDER_MALFORMED_RESPONSE",
      502
    );

    this.name =
      "JobProviderMalformedResponseError";
  }
}