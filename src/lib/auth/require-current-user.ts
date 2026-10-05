import type {
    CurrentUser,
    CurrentUserProvider,
  } from "./current-user-provider";
  
  import {
    AuthenticationRequiredError,
  } from "./errors";
  
  /**
   * Resolves the current CareerLM user for operations that require
   * authentication.
   *
   * Application services should use this function instead of repeatedly
   * implementing their own null/session checks.
   */
  export async function requireCurrentUser(
    provider: CurrentUserProvider
  ): Promise<CurrentUser> {
    const currentUser =
      await provider.getCurrentUser();
  
    if (!currentUser) {
      throw new AuthenticationRequiredError();
    }
  
    const normalizedUserId =
      currentUser.id.trim();
  
    /**
     * A provider returning an empty ID is not considered a valid
     * authenticated CareerLM identity.
     */
    if (!normalizedUserId) {
      throw new AuthenticationRequiredError(
        "The current user session does not contain a valid user ID."
      );
    }
  
    return {
      id: normalizedUserId,
    };
  }