import {
    redirect,
  } from "next/navigation";
  
  import {
    ConfiguredCurrentUserProvider,
  } from "./configured-current-user-provider";
  
  import type {
    CurrentUser,
    CurrentUserProvider,
  } from "./current-user-provider";
  
  import {
    SessionCurrentUserProvider,
  } from "./session-current-user-provider";
  
  /**
   * Resolves the provider used by server-rendered page authentication.
   *
   * Development and production requests use the database-backed session
   * provider.
   *
   * Automated tests retain CareerLM's configured synthetic identity so
   * page unit tests do not require a real Next.js request/cookie context.
   */
  function createPageCurrentUserProvider():
    CurrentUserProvider {
    if (
      process.env.NODE_ENV ===
      "test"
    ) {
      return new ConfiguredCurrentUserProvider();
    }
  
    return new SessionCurrentUserProvider();
  }
  
  /**
   * Protects server-rendered CareerLM pages.
   *
   * Unauthenticated runtime users are redirected to the login page.
   */
  export async function requireAuthenticatedPageUser():
    Promise<CurrentUser> {
    const provider =
      createPageCurrentUserProvider();
  
    const user =
      await provider
        .getCurrentUser();
  
    if (!user) {
      redirect(
        "/login"
      );
    }
  
    return user;
  }