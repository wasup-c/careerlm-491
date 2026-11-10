import type {
    UserAccountRecord,
  } from "./domain";
  
  import {
    AuthValidationError,
    InvalidCredentialsError,
    SessionTokenAlreadyExistsError,
  } from "./errors";
  
  import {
    hashPassword,
    verifyPassword,
  } from "./password";
  
  import type {
    AuthRepository,
  } from "./repository";
  
  import {
    createSessionExpiration,
    generateSessionToken,
    hashSessionToken,
  } from "./session-token";
  
  const MAX_SESSION_TOKEN_ATTEMPTS =
    3;
  
  export interface AuthenticatedUser {
    readonly id: string;
    readonly email: string;
  }
  
  export interface IssuedAuthSession {
    readonly user:
      AuthenticatedUser;
  
    /**
     * Raw session token intended for the user's HttpOnly cookie.
     *
     * This value must never be persisted directly in PostgreSQL.
     */
    readonly token: string;
  
    readonly expiresAt: string;
  }
  
  interface AuthServiceDependencies {
    readonly now?: () => Date;
  
    readonly generateToken?:
      () => string;
  }
  
  /**
   * Coordinates CareerLM account authentication and session lifecycle.
   *
   * Password hashing and raw session-token handling stay above the
   * persistence repository so PostgreSQL never receives plaintext
   * passwords or raw session tokens.
   */
  export class AuthService {
    private readonly now:
      () => Date;
  
    private readonly generateToken:
      () => string;
  
    constructor(
      private readonly repository:
        AuthRepository,
      dependencies:
        AuthServiceDependencies = {}
    ) {
      this.now =
        dependencies.now ??
        (() => new Date());
  
      this.generateToken =
        dependencies.generateToken ??
        generateSessionToken;
    }
  
    private toAuthenticatedUser(
      user: UserAccountRecord
    ): AuthenticatedUser {
      return {
        id: user.id,
        email: user.email,
      };
    }
  
    private async issueSession(
      user: UserAccountRecord
    ): Promise<IssuedAuthSession> {
      for (
        let attempt = 0;
        attempt <
          MAX_SESSION_TOKEN_ATTEMPTS;
        attempt += 1
      ) {
        const rawToken =
          this.generateToken();
  
        const tokenHash =
          hashSessionToken(
            rawToken
          );
  
        const expiresAt =
          createSessionExpiration(
            this.now()
          );
  
        try {
          const session =
            await this.repository
              .createSession(
                user.id,
                {
                  tokenHash,
                  expiresAt,
                }
              );
  
          return {
            user:
              this.toAuthenticatedUser(
                user
              ),
            token: rawToken,
            expiresAt:
              session.expiresAt,
          };
        } catch (error) {
          if (
            error instanceof
              SessionTokenAlreadyExistsError
          ) {
            continue;
          }
  
          throw error;
        }
      }
  
      throw new Error(
        "Unable to create a unique authentication session."
      );
    }
  
    /**
     * Creates a new CareerLM account and immediately issues a session.
     */
    async register(
      email: string,
      password: string
    ): Promise<IssuedAuthSession> {
      const passwordHash =
        await hashPassword(
          password
        );
  
      const user =
        await this.repository
          .createUser({
            email,
            passwordHash,
          });
  
      return this.issueSession(
        user
      );
    }
  
    /**
     * Authenticates an existing CareerLM account and issues a new
     * session.
     *
     * Unknown emails and incorrect passwords intentionally produce the
     * same InvalidCredentialsError.
     */
    async login(
      email: string,
      password: string
    ): Promise<IssuedAuthSession> {
      let user:
        UserAccountRecord | null;
  
      try {
        user =
          await this.repository
            .findUserByEmail(
              email
            );
      } catch (error) {
        if (
          error instanceof
            AuthValidationError
        ) {
          throw new InvalidCredentialsError();
        }
  
        throw error;
      }
  
      if (!user) {
        throw new InvalidCredentialsError();
      }
  
      const passwordMatches =
        await verifyPassword(
          password,
          user.passwordHash
        );
  
      if (!passwordMatches) {
        throw new InvalidCredentialsError();
      }
  
      return this.issueSession(
        user
      );
    }
  
    /**
     * Invalidates the session represented by a raw browser token.
     *
     * Logout is intentionally idempotent.
     */
    async logout(
      rawToken:
        string | null | undefined
    ): Promise<void> {
      if (!rawToken) {
        return;
      }
  
      await this.repository
        .deleteSessionByTokenHash(
          hashSessionToken(
            rawToken
          )
        );
    }
  
    /**
     * Resolves a raw browser session token into the authenticated
     * CareerLM user.
     *
     * Missing, unknown, expired, or orphaned sessions resolve to null.
     */
    async resolveSession(
      rawToken:
        string | null | undefined
    ): Promise<AuthenticatedUser | null> {
      if (!rawToken) {
        return null;
      }
  
      const tokenHash =
        hashSessionToken(
          rawToken
        );
  
      const session =
        await this.repository
          .findSessionByTokenHash(
            tokenHash
          );
  
      if (!session) {
        return null;
      }
  
      const expiresAt =
        new Date(
          session.expiresAt
        );
  
      if (
        Number.isNaN(
          expiresAt.getTime()
        ) ||
        expiresAt.getTime() <=
          this.now().getTime()
      ) {
        await this.repository
          .deleteSessionByTokenHash(
            tokenHash
          );
  
        return null;
      }
  
      const user =
        await this.repository
          .findUserById(
            session.userId
          );
  
      if (!user) {
        await this.repository
          .deleteSessionByTokenHash(
            tokenHash
          );
  
        return null;
      }
  
      return this.toAuthenticatedUser(
        user
      );
    }
  }