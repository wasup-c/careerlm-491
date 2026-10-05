import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import type {
    CurrentUser,
    CurrentUserProvider,
  } from "./current-user-provider";
  
  import {
    DemoCurrentUserProvider,
  } from "./demo-current-user-provider";
  
  import {
    AuthenticationRequiredError,
  } from "./errors";
  
  import {
    requireCurrentUser,
  } from "./require-current-user";
  
  /**
   * Lightweight provider used to exercise authenticated and
   * unauthenticated application behavior without using a real
   * authentication system.
   */
  class TestCurrentUserProvider
    implements CurrentUserProvider
  {
    constructor(
      private readonly user:
        CurrentUser | null
    ) {}
  
    async getCurrentUser():
      Promise<CurrentUser | null>
    {
      return this.user;
    }
  }
  
  describe(
    "DemoCurrentUserProvider",
    () => {
      it(
        "returns the default demo user",
        async () => {
          const provider =
            new DemoCurrentUserProvider();
  
          const user =
            await provider
              .getCurrentUser();
  
          expect(user).toEqual({
            id: "demo-user",
          });
        }
      );
  
      it(
        "supports a configured demo user",
        async () => {
          const provider =
            new DemoCurrentUserProvider(
              "user-123"
            );
  
          const user =
            await provider
              .getCurrentUser();
  
          expect(user).toEqual({
            id: "user-123",
          });
        }
      );
  
      it(
        "normalizes the configured user ID",
        async () => {
          const provider =
            new DemoCurrentUserProvider(
              "  user-123  "
            );
  
          const user =
            await provider
              .getCurrentUser();
  
          expect(user).toEqual({
            id: "user-123",
          });
        }
      );
  
      it(
        "rejects an empty demo user ID",
        () => {
          expect(
            () =>
              new DemoCurrentUserProvider(
                "   "
              )
          ).toThrow(
            "Demo current user ID cannot be empty."
          );
        }
      );
  
      it(
        "returns independent user objects",
        async () => {
          const provider =
            new DemoCurrentUserProvider(
              "user-123"
            );
  
          const first =
            await provider
              .getCurrentUser();
  
          const second =
            await provider
              .getCurrentUser();
  
          expect(first).toEqual(
            second
          );
  
          expect(first).not.toBe(
            second
          );
        }
      );
    }
  );
  
  describe(
    "requireCurrentUser",
    () => {
      it(
        "returns the authenticated user",
        async () => {
          const provider =
            new TestCurrentUserProvider({
              id: "user-1",
            });
  
          const user =
            await requireCurrentUser(
              provider
            );
  
          expect(user).toEqual({
            id: "user-1",
          });
        }
      );
  
      it(
        "normalizes the authenticated user ID",
        async () => {
          const provider =
            new TestCurrentUserProvider({
              id: "  user-1  ",
            });
  
          const user =
            await requireCurrentUser(
              provider
            );
  
          expect(user).toEqual({
            id: "user-1",
          });
        }
      );
  
      it(
        "throws AuthenticationRequiredError when no current user exists",
        async () => {
          const provider =
            new TestCurrentUserProvider(
              null
            );
  
          await expect(
            requireCurrentUser(
              provider
            )
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
        }
      );
  
      it(
        "rejects a current user with an empty ID",
        async () => {
          const provider =
            new TestCurrentUserProvider({
              id: "   ",
            });
  
          await expect(
            requireCurrentUser(
              provider
            )
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
        }
      );
  
      it(
        "uses the expected authentication error code and status",
        async () => {
          const provider =
            new TestCurrentUserProvider(
              null
            );
  
          try {
            await requireCurrentUser(
              provider
            );
  
            throw new Error(
              "Expected requireCurrentUser to throw."
            );
          } catch (error) {
            expect(
              error
            ).toBeInstanceOf(
              AuthenticationRequiredError
            );
  
            if (
              error instanceof
              AuthenticationRequiredError
            ) {
              expect(
                error.code
              ).toBe(
                "AUTHENTICATION_REQUIRED"
              );
  
              expect(
                error.status
              ).toBe(401);
  
              expect(
                error.name
              ).toBe(
                "AuthenticationRequiredError"
              );
            }
          }
        }
      );
    }
  );