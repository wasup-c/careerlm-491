import {
    cookies,
  } from "next/headers";
  
  import type {
    CurrentUser,
    CurrentUserProvider,
  } from "./current-user-provider";
  
  import {
    getDefaultAuthService,
  } from "./default-auth-service";
  
  import {
    SESSION_COOKIE_NAME,
  } from "./session-cookie";
  
  /**
   * Resolves CareerLM's authenticated user from the HttpOnly session
   * cookie and database-backed session store.
   */
  export class SessionCurrentUserProvider
    implements CurrentUserProvider
  {
    async getCurrentUser():
      Promise<CurrentUser | null> {
      const cookieStore =
        await cookies();
  
      const rawToken =
        cookieStore.get(
          SESSION_COOKIE_NAME
        )?.value;
  
      if (!rawToken) {
        return null;
      }
  
      const authenticatedUser =
        await getDefaultAuthService()
          .resolveSession(
            rawToken
          );
  
      if (
        !authenticatedUser
      ) {
        return null;
      }
  
      return {
        id:
          authenticatedUser.id,
      };
    }
  }