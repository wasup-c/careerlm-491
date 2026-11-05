import type {
    CurrentUser,
    CurrentUserProvider,
  } from "./current-user-provider";
  
  /**
   * Resolves CareerLM's current local/development identity from explicit
   * environment configuration.
   *
   * This is not production authentication. It removes the previous implicit
   * hard-coded demo identity while preserving the CurrentUserProvider boundary
   * until a real authentication/session provider is integrated.
   */
  export class ConfiguredCurrentUserProvider
    implements CurrentUserProvider
  {
    async getCurrentUser():
      Promise<CurrentUser | null>
    {
      const configuredUserId =
        process.env
          .CAREERLM_USER_ID
          ?.trim();
  
      if (
        configuredUserId
      ) {
        return {
          id:
            configuredUserId,
        };
      }
  
      /**
       * Existing automated tests may construct the default service without an
       * environment file. Keep their synthetic identity isolated to NODE_ENV=test
       * so production/development runtime never silently becomes demo-user.
       */
      if (
        process.env.NODE_ENV ===
        "test"
      ) {
        return {
          id:
            "demo-user",
        };
      }
  
      return null;
    }
  }