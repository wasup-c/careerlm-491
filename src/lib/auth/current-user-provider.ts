/**
 * Minimal application-level representation of the currently
 * authenticated CareerLM user.
 *
 * Additional profile information should not be added here unless
 * application authorization genuinely depends on it.
 */
export interface CurrentUser {
    readonly id: string;
  }
  
  /**
   * Abstraction used by application services to determine which user
   * is currently active.
   *
   * Implementations may resolve the user from:
   * - the current CareerLM demo session
   * - a future authentication/session provider
   * - automated test fixtures
   *
   * Returning null represents an unauthenticated session.
   */
  export interface CurrentUserProvider {
    getCurrentUser():
      Promise<CurrentUser | null>;
  }