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

/**
 * Raised when authentication-related input fails validation.
 */
export class AuthValidationError
  extends Error
{
  readonly code =
    "AUTH_VALIDATION_ERROR";

  readonly status = 400;

  constructor(
    message: string
  ) {
    super(message);

    this.name =
      "AuthValidationError";
  }
}

/**
 * Raised when registration attempts to use an email address that
 * already belongs to an authenticated CareerLM account.
 */
export class UserEmailAlreadyExistsError
  extends Error
{
  readonly code =
    "USER_EMAIL_ALREADY_EXISTS";

  readonly status = 409;

  constructor() {
    super(
      "A user with that email already exists."
    );

    this.name =
      "UserEmailAlreadyExistsError";
  }
}

/**
 * Raised when an authentication operation references a user account
 * that does not exist.
 */
export class AuthUserNotFoundError
  extends Error
{
  readonly code =
    "AUTH_USER_NOT_FOUND";

  readonly status = 404;

  constructor() {
    super(
      "The authentication user was not found."
    );

    this.name =
      "AuthUserNotFoundError";
  }
}

/**
 * Raised if a generated session token hash collides with an existing
 * stored session.
 */
export class SessionTokenAlreadyExistsError
  extends Error
{
  readonly code =
    "SESSION_TOKEN_ALREADY_EXISTS";

  readonly status = 409;

  constructor() {
    super(
      "The session token already exists."
    );

    this.name =
      "SessionTokenAlreadyExistsError";
  }
}