/**
 * Raised when an operation requires an authenticated CareerLM user
 * but no current user can be resolved.
 */
export class AuthenticationRequiredError
  extends Error
{
  readonly code =
    "AUTHENTICATION_REQUIRED";

  readonly status = 401;

  constructor(
    message =
      "Authentication is required."
  ) {
    super(message);

    this.name =
      "AuthenticationRequiredError";
  }
}