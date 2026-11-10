import {
    randomUUID,
  } from "node:crypto";
  
  import type {
    Pool,
    QueryResultRow,
  } from "pg";
  
  import type {
    CreateSessionInput,
    CreateUserInput,
    SessionRecord,
    UserAccountRecord,
  } from "./domain";
  
  import {
    AuthUserNotFoundError,
    SessionTokenAlreadyExistsError,
    UserEmailAlreadyExistsError,
  } from "./errors";
  
  import type {
    AuthRepository,
  } from "./repository";
  
  import {
    normalizeAuthUserId,
    normalizeEmail,
    normalizePasswordHash,
    normalizeSessionExpiration,
    normalizeTokenHash,
  } from "./validation";
  
  interface UserRow
    extends QueryResultRow {
    id: string;
    email: string;
    password_hash: string;
    created_at: Date | string;
    updated_at: Date | string;
  }
  
  interface SessionRow
    extends QueryResultRow {
    id: string;
    user_id: string;
    token_hash: string;
    expires_at: Date | string;
    created_at: Date | string;
  }
  
  function toIsoTimestamp(
    value: Date | string
  ): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
  
    return new Date(
      value
    ).toISOString();
  }
  
  function userRowToRecord(
    row: UserRow
  ): UserAccountRecord {
    return {
      id: row.id,
      email: row.email,
      passwordHash:
        row.password_hash,
      createdAt:
        toIsoTimestamp(
          row.created_at
        ),
      updatedAt:
        toIsoTimestamp(
          row.updated_at
        ),
    };
  }
  
  function sessionRowToRecord(
    row: SessionRow
  ): SessionRecord {
    return {
      id: row.id,
      userId: row.user_id,
      tokenHash:
        row.token_hash,
      expiresAt:
        toIsoTimestamp(
          row.expires_at
        ),
      createdAt:
        toIsoTimestamp(
          row.created_at
        ),
    };
  }
  
  function getPostgresErrorCode(
    error: unknown
  ): string | null {
    if (
      typeof error !==
        "object" ||
      error === null ||
      !("code" in error)
    ) {
      return null;
    }
  
    const code =
      error.code;
  
    return typeof code ===
      "string"
      ? code
      : null;
  }
  
  /**
   * PostgreSQL-backed authentication persistence.
   *
   * This repository stores account metadata, password hashes, and
   * session-token hashes. Plaintext passwords and raw session tokens
   * must never be passed into this layer.
   */
  export class PostgresAuthRepository
    implements AuthRepository
  {
    constructor(
      private readonly pool:
        Pool
    ) {}
  
    async createUser(
      input: CreateUserInput
    ): Promise<UserAccountRecord> {
      const email =
        normalizeEmail(
          input.email
        );
  
      const passwordHash =
        normalizePasswordHash(
          input.passwordHash
        );
  
      const userId =
        randomUUID();
  
      try {
        const result =
          await this.pool.query<UserRow>(
            `
              INSERT INTO users (
                id,
                email,
                password_hash,
                created_at,
                updated_at
              )
              VALUES (
                $1,
                $2,
                $3,
                NOW(),
                NOW()
              )
              RETURNING
                id,
                email,
                password_hash,
                created_at,
                updated_at
            `,
            [
              userId,
              email,
              passwordHash,
            ]
          );
  
        return userRowToRecord(
          result.rows[0]
        );
      } catch (error) {
        if (
          getPostgresErrorCode(
            error
          ) === "23505"
        ) {
          throw new UserEmailAlreadyExistsError();
        }
  
        throw error;
      }
    }
  
    async findUserByEmail(
      email: string
    ): Promise<UserAccountRecord | null> {
      const normalizedEmail =
        normalizeEmail(email);
  
      const result =
        await this.pool.query<UserRow>(
          `
            SELECT
              id,
              email,
              password_hash,
              created_at,
              updated_at
            FROM users
            WHERE email = $1
              AND password_hash
                IS NOT NULL
          `,
          [normalizedEmail]
        );
  
      const row =
        result.rows[0];
  
      return row
        ? userRowToRecord(row)
        : null;
    }
  
    async findUserById(
      userId: string
    ): Promise<UserAccountRecord | null> {
      const normalizedUserId =
        normalizeAuthUserId(
          userId
        );
  
      const result =
        await this.pool.query<UserRow>(
          `
            SELECT
              id,
              email,
              password_hash,
              created_at,
              updated_at
            FROM users
            WHERE id = $1
              AND email IS NOT NULL
              AND password_hash
                IS NOT NULL
          `,
          [normalizedUserId]
        );
  
      const row =
        result.rows[0];
  
      return row
        ? userRowToRecord(row)
        : null;
    }
  
    async createSession(
      userId: string,
      input: CreateSessionInput
    ): Promise<SessionRecord> {
      const normalizedUserId =
        normalizeAuthUserId(
          userId
        );
  
      const tokenHash =
        normalizeTokenHash(
          input.tokenHash
        );
  
      const expiresAt =
        normalizeSessionExpiration(
          input.expiresAt
        );
  
      const user =
        await this.findUserById(
          normalizedUserId
        );
  
      if (!user) {
        throw new AuthUserNotFoundError();
      }
  
      const sessionId =
        randomUUID();
  
      try {
        const result =
          await this.pool.query<SessionRow>(
            `
              INSERT INTO sessions (
                id,
                user_id,
                token_hash,
                expires_at,
                created_at
              )
              VALUES (
                $1,
                $2,
                $3,
                $4,
                NOW()
              )
              RETURNING
                id,
                user_id,
                token_hash,
                expires_at,
                created_at
            `,
            [
              sessionId,
              normalizedUserId,
              tokenHash,
              expiresAt,
            ]
          );
  
        return sessionRowToRecord(
          result.rows[0]
        );
      } catch (error) {
        if (
          getPostgresErrorCode(
            error
          ) === "23505"
        ) {
          throw new SessionTokenAlreadyExistsError();
        }
  
        throw error;
      }
    }
  
    async findSessionByTokenHash(
      tokenHash: string
    ): Promise<SessionRecord | null> {
      const normalizedTokenHash =
        normalizeTokenHash(
          tokenHash
        );
  
      const result =
        await this.pool.query<SessionRow>(
          `
            SELECT
              id,
              user_id,
              token_hash,
              expires_at,
              created_at
            FROM sessions
            WHERE token_hash = $1
          `,
          [normalizedTokenHash]
        );
  
      const row =
        result.rows[0];
  
      return row
        ? sessionRowToRecord(row)
        : null;
    }
  
    async deleteSessionByTokenHash(
      tokenHash: string
    ): Promise<void> {
      const normalizedTokenHash =
        normalizeTokenHash(
          tokenHash
        );
  
      await this.pool.query(
        `
          DELETE FROM sessions
          WHERE token_hash = $1
        `,
        [normalizedTokenHash]
      );
    }
  
    async deleteExpiredSessions(
      referenceTime:
        Date = new Date()
    ): Promise<number> {
      if (
        Number.isNaN(
          referenceTime.getTime()
        )
      ) {
        return 0;
      }
  
      const result =
        await this.pool.query(
          `
            DELETE FROM sessions
            WHERE expires_at <= $1
          `,
          [referenceTime]
        );
  
      return (
        result.rowCount ??
        0
      );
    }
  }