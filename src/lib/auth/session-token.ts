import {
    createHash,
    randomBytes,
  } from "node:crypto";
  
  const SESSION_TOKEN_BYTES =
    32;
  
  export const SESSION_DURATION_MS =
    7 *
    24 *
    60 *
    60 *
    1000;
  
  /**
   * Generates a cryptographically secure random session token.
   *
   * This raw token is intended for the user's HttpOnly cookie and must
   * never be stored directly in PostgreSQL.
   */
  export function generateSessionToken():
    string {
    return randomBytes(
      SESSION_TOKEN_BYTES
    ).toString(
      "base64url"
    );
  }
  
  /**
   * Produces the deterministic SHA-256 hash stored in PostgreSQL.
   */
  export function hashSessionToken(
    token: string
  ): string {
    return createHash(
      "sha256"
    )
      .update(
        token,
        "utf8"
      )
      .digest(
        "hex"
      );
  }
  
  /**
   * Creates the expiration timestamp for a newly issued session.
   */
  export function createSessionExpiration(
    now: Date = new Date()
  ): Date {
    return new Date(
      now.getTime() +
        SESSION_DURATION_MS
    );
  }