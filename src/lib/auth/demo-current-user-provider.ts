import type {
    CurrentUser,
    CurrentUserProvider,
  } from "./current-user-provider";
  
  /**
   * Current-user provider used by the CareerLM demo/MVP environment.
   *
   * The rest of the application should depend on CurrentUserProvider
   * rather than directly depending on this implementation.
   *
   * A future authentication provider can therefore replace the demo
   * implementation without changing application-service code.
   */
  export class DemoCurrentUserProvider
    implements CurrentUserProvider
  {
    private readonly currentUser:
      CurrentUser;
  
    constructor(
      userId = "demo-user"
    ) {
      const normalizedUserId =
        userId.trim();
  
      if (!normalizedUserId) {
        throw new Error(
          "Demo current user ID cannot be empty."
        );
      }
  
      this.currentUser = {
        id: normalizedUserId,
      };
    }
  
    async getCurrentUser():
      Promise<CurrentUser>
    {
      /**
       * Return a fresh object so callers cannot retain or mutate the
       * provider's internal identity object.
       */
      return {
        ...this.currentUser,
      };
    }
  }