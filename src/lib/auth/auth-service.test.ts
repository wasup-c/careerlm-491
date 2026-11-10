import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import type {
    CreateSessionInput,
    CreateUserInput,
    SessionRecord,
    UserAccountRecord,
  } from "./domain";
  
  import {
    InvalidCredentialsError,
    UserEmailAlreadyExistsError,
  } from "./errors";
  
  import {
    AuthService,
  } from "./auth-service";
  
  import {
    hashPassword,
    verifyPassword,
  } from "./password";
  
  import type {
    AuthRepository,
  } from "./repository";
  
  import {
    SESSION_DURATION_MS,
    hashSessionToken,
  } from "./session-token";
  
  import {
    normalizeEmail,
  } from "./validation";
  
  class TestAuthRepository
    implements AuthRepository
  {
    private userSequence =
      0;
  
    readonly users =
      new Map<
        string,
        UserAccountRecord
      >();
  
    readonly sessions =
      new Map<
        string,
        SessionRecord
      >();
  
    async createUser(
      input: CreateUserInput
    ): Promise<UserAccountRecord> {
      const email =
        normalizeEmail(
          input.email
        );
  
      const existing =
        [...this.users.values()]
          .find(
            (user) =>
              user.email ===
              email
          );
  
      if (existing) {
        throw new UserEmailAlreadyExistsError();
      }
  
      this.userSequence += 1;
  
      const timestamp =
        new Date(
          "2026-11-09T20:00:00.000Z"
        ).toISOString();
  
      const user:
        UserAccountRecord = {
          id:
            `test-user-${this.userSequence}`,
          email,
          passwordHash:
            input.passwordHash,
          createdAt:
            timestamp,
          updatedAt:
            timestamp,
        };
  
      this.users.set(
        user.id,
        user
      );
  
      return user;
    }
  
    async findUserByEmail(
      email: string
    ): Promise<UserAccountRecord | null> {
      const normalized =
        normalizeEmail(email);
  
      return (
        [...this.users.values()]
          .find(
            (user) =>
              user.email ===
              normalized
          ) ??
        null
      );
    }
  
    async findUserById(
      userId: string
    ): Promise<UserAccountRecord | null> {
      return (
        this.users.get(
          userId
        ) ??
        null
      );
    }
  
    async createSession(
      userId: string,
      input: CreateSessionInput
    ): Promise<SessionRecord> {
      const session:
        SessionRecord = {
          id:
            `test-session-${this.sessions.size + 1}`,
          userId,
          tokenHash:
            input.tokenHash,
          expiresAt:
            input.expiresAt
              .toISOString(),
          createdAt:
            new Date(
              "2026-11-09T20:00:00.000Z"
            ).toISOString(),
        };
  
      this.sessions.set(
        session.tokenHash,
        session
      );
  
      return session;
    }
  
    async findSessionByTokenHash(
      tokenHash: string
    ): Promise<SessionRecord | null> {
      return (
        this.sessions.get(
          tokenHash
        ) ??
        null
      );
    }
  
    async deleteSessionByTokenHash(
      tokenHash: string
    ): Promise<void> {
      this.sessions.delete(
        tokenHash
      );
    }
  
    async deleteExpiredSessions(
      referenceTime:
        Date = new Date()
    ): Promise<number> {
      let deleted =
        0;
  
      for (
        const [
          tokenHash,
          session,
        ]
        of this.sessions.entries()
      ) {
        if (
          new Date(
            session.expiresAt
          ).getTime() <=
          referenceTime.getTime()
        ) {
          this.sessions.delete(
            tokenHash
          );
  
          deleted += 1;
        }
      }
  
      return deleted;
    }
  }
  
  describe(
    "AuthService",
    () => {
      it(
        "registers a normalized account with a hashed password and hashed session token",
        async () => {
          const repository =
            new TestAuthRepository();
  
          const now =
            new Date(
              "2026-11-09T20:00:00.000Z"
            );
  
          const rawToken =
            "registration-session-token";
  
          const service =
            new AuthService(
              repository,
              {
                now:
                  () => now,
                generateToken:
                  () =>
                    rawToken,
              }
            );
  
          const result =
            await service.register(
              "  USER@EXAMPLE.COM ",
              "CareerLM-Test-Password-123!"
            );
  
          expect(
            result.user.email
          ).toBe(
            "user@example.com"
          );
  
          expect(
            result.token
          ).toBe(
            rawToken
          );
  
          const storedUser =
            repository.users.get(
              result.user.id
            );
  
          expect(
            storedUser
          ).toBeDefined();
  
          expect(
            storedUser?.passwordHash
          ).not.toBe(
            "CareerLM-Test-Password-123!"
          );
  
          expect(
            await verifyPassword(
              "CareerLM-Test-Password-123!",
              storedUser
                ?.passwordHash ??
                ""
            )
          ).toBe(true);
  
          const storedSession =
            repository.sessions.get(
              hashSessionToken(
                rawToken
              )
            );
  
          expect(
            storedSession
          ).toBeDefined();
  
          expect(
            storedSession?.tokenHash
          ).not.toBe(
            rawToken
          );
  
          expect(
            new Date(
              result.expiresAt
            ).getTime() -
              now.getTime()
          ).toBe(
            SESSION_DURATION_MS
          );
        }
      );
  
      it(
        "rejects duplicate registration emails case-insensitively",
        async () => {
          const repository =
            new TestAuthRepository();
  
          const service =
            new AuthService(
              repository
            );
  
          await service.register(
            "user@example.com",
            "CareerLM-Test-Password-123!"
          );
  
          await expect(
            service.register(
              "USER@EXAMPLE.COM",
              "Another-Test-Password-123!"
            )
          ).rejects.toBeInstanceOf(
            UserEmailAlreadyExistsError
          );
        }
      );
  
      it(
        "logs in an existing account with the correct password",
        async () => {
          const repository =
            new TestAuthRepository();
  
          const passwordHash =
            await hashPassword(
              "CareerLM-Test-Password-123!"
            );
  
          const user =
            await repository
              .createUser({
                email:
                  "user@example.com",
                passwordHash,
              });
  
          const service =
            new AuthService(
              repository,
              {
                generateToken:
                  () =>
                    "login-session-token",
              }
            );
  
          const result =
            await service.login(
              "USER@EXAMPLE.COM",
              "CareerLM-Test-Password-123!"
            );
  
          expect(
            result.user
          ).toEqual({
            id: user.id,
            email:
              "user@example.com",
          });
  
          expect(
            result.token
          ).toBe(
            "login-session-token"
          );
        }
      );
  
      it(
        "uses the same error for an unknown email and an incorrect password",
        async () => {
          const repository =
            new TestAuthRepository();
  
          const service =
            new AuthService(
              repository
            );
  
          const passwordHash =
            await hashPassword(
              "CareerLM-Test-Password-123!"
            );
  
          await repository
            .createUser({
              email:
                "user@example.com",
              passwordHash,
            });
  
          await expect(
            service.login(
              "missing@example.com",
              "CareerLM-Test-Password-123!"
            )
          ).rejects.toBeInstanceOf(
            InvalidCredentialsError
          );
  
          await expect(
            service.login(
              "user@example.com",
              "Wrong-Password-123!"
            )
          ).rejects.toBeInstanceOf(
            InvalidCredentialsError
          );
        }
      );
  
      it(
        "logs out by hashing and deleting the raw session token",
        async () => {
          const repository =
            new TestAuthRepository();
  
          const rawToken =
            "logout-session-token";
  
          const service =
            new AuthService(
              repository,
              {
                generateToken:
                  () =>
                    rawToken,
              }
            );
  
          await service.register(
            "user@example.com",
            "CareerLM-Test-Password-123!"
          );
  
          const tokenHash =
            hashSessionToken(
              rawToken
            );
  
          expect(
            repository.sessions.has(
              tokenHash
            )
          ).toBe(true);
  
          await service.logout(
            rawToken
          );
  
          expect(
            repository.sessions.has(
              tokenHash
            )
          ).toBe(false);
  
          await service.logout(
            rawToken
          );
        }
      );
  
      it(
        "resolves a valid session to the authenticated user",
        async () => {
          const repository =
            new TestAuthRepository();
  
          const rawToken =
            "resolve-session-token";
  
          const service =
            new AuthService(
              repository,
              {
                generateToken:
                  () =>
                    rawToken,
              }
            );
  
          const registration =
            await service.register(
              "user@example.com",
              "CareerLM-Test-Password-123!"
            );
  
          expect(
            await service.resolveSession(
              rawToken
            )
          ).toEqual(
            registration.user
          );
  
          expect(
            await service.resolveSession(
              "unknown-session-token"
            )
          ).toBeNull();
  
          expect(
            await service.resolveSession(
              null
            )
          ).toBeNull();
        }
      );
  
      it(
        "deletes an expired session and resolves it as unauthenticated",
        async () => {
          const repository =
            new TestAuthRepository();
  
          let currentTime =
            new Date(
              "2026-11-09T20:00:00.000Z"
            );
  
          const rawToken =
            "expiring-session-token";
  
          const service =
            new AuthService(
              repository,
              {
                now:
                  () =>
                    currentTime,
                generateToken:
                  () =>
                    rawToken,
              }
            );
  
          await service.register(
            "user@example.com",
            "CareerLM-Test-Password-123!"
          );
  
          const tokenHash =
            hashSessionToken(
              rawToken
            );
  
          expect(
            repository.sessions.has(
              tokenHash
            )
          ).toBe(true);
  
          currentTime =
            new Date(
              currentTime.getTime() +
                SESSION_DURATION_MS +
                1
            );
  
          expect(
            await service.resolveSession(
              rawToken
            )
          ).toBeNull();
  
          expect(
            repository.sessions.has(
              tokenHash
            )
          ).toBe(false);
        }
      );
    }
  );