export const SESSION_COOKIE_NAME =
  "careerlm_session";

const SESSION_COOKIE_BASE_OPTIONS = {
  httpOnly: true,
  sameSite:
    "lax" as const,
  secure:
    process.env.NODE_ENV ===
    "production",
  path: "/",
};

/**
 * Cookie configuration used when issuing a new authenticated session.
 */
export function createSessionCookieOptions(
  expiresAt: Date
) {
  return {
    ...SESSION_COOKIE_BASE_OPTIONS,
    expires: expiresAt,
  };
}

/**
 * Cookie configuration used after a server-side session has been
 * successfully invalidated.
 */
export function createClearedSessionCookieOptions() {
  return {
    ...SESSION_COOKIE_BASE_OPTIONS,
    expires:
      new Date(0),
    maxAge: 0,
  };
}