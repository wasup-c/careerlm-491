/**
 * Raised when CareerLM job-domain input violates the shared application
 * contract.
 *
 * External provider errors will use separate provider-specific/application
 * error types in S5-M1-03.
 */
export class JobValidationError
  extends Error
{
  constructor(
    message: string
  ) {
    super(message);

    this.name =
      "JobValidationError";
  }
}