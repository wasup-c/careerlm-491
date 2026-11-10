import {
    createHash,
  } from "node:crypto";
  
  import {
    Pool,
  } from "pg";
  
  import {
    afterAll,
    beforeEach,
    describe,
    expect,
    it,
  } from "vitest";
  
  import {
    AuthUserNotFoundError,
    UserEmailAlreadyExistsError,
  } from "./errors";
  
  import {
    PostgresAuthRepository,
  } from "./postgres-auth-repository";
  
  const databaseUrl =
    process.env.DATABASE_URL?.trim();
  
  const describeDatabase =
    databaseUrl
      ? describe
      : describe.skip;
  
  function hashToken(
    token: string
  ): string {
    return createHash(
      "sha256"
    )
      .update(token)
      .digest("hex");
  }
  
  describeDatabase(
    "PostgresAuthRepository",
    () => {
      const pool =
        new Pool({
          connectionString:
            databaseUrl,
        });
  
      const repository =
        new PostgresAuthRepository(
          pool
        );
  
      const emailA =
        "postgres-auth-a@example.com";
  
      const emailB =
        "postgres-auth-b@example.com";
  
      async function cleanup() {
        await pool.query(
          `
            DELETE FROM users
            WHERE email = ANY(
              $1::text[]
            )
          `,
          [[emailA, emailB]]
        );
      }
  
      beforeEach(async () => {
        await cleanup();
      });
  
      afterAll(async () => {
        await cleanup();
  
        await pool.end();
      });
  
      it(
        "creates and retrieves a normalized user account",
        async () => {
          const created =
            await repository.createUser({
              email:
                "  POSTGRES-AUTH-A@EXAMPLE.COM  ",
              passwordHash:
                "test-password-hash-a",
            });
  
          expect(
            created.email
          ).toBe(emailA);
  
          expect(
            created.passwordHash
          ).toBe(
            "test-password-hash-a"
          );
  
          expect(
            created.id
          ).not.toBe("");
  
          expect(
            await repository.findUserByEmail(
              "POSTGRES-AUTH-A@EXAMPLE.COM"
            )
          ).toMatchObject({
            id: created.id,
            email: emailA,
            passwordHash:
              "test-password-hash-a",
          });
  
          expect(
            await repository.findUserById(
              created.id
            )
          ).toMatchObject({
            id: created.id,
            email: emailA,
          });
        }
      );
  
      it(
        "rejects duplicate email addresses case-insensitively",
        async () => {
          await repository.createUser({
            email: emailA,
            passwordHash:
              "test-password-hash-a",
          });
  
          await expect(
            repository.createUser({
              email:
                "POSTGRES-AUTH-A@EXAMPLE.COM",
              passwordHash:
                "another-password-hash",
            })
          ).rejects.toBeInstanceOf(
            UserEmailAlreadyExistsError
          );
        }
      );
  
      it(
        "creates, retrieves, and deletes a session",
        async () => {
          const user =
            await repository.createUser({
              email: emailA,
              passwordHash:
                "test-password-hash-a",
            });
  
          const rawToken =
            "session-token-a";
  
          const tokenHash =
            hashToken(rawToken);
  
          const expiresAt =
            new Date(
              Date.now() +
                60 * 60 * 1000
            );
  
          const session =
            await repository.createSession(
              user.id,
              {
                tokenHash,
                expiresAt,
              }
            );
  
          expect(
            session.userId
          ).toBe(user.id);
  
          expect(
            session.tokenHash
          ).toBe(tokenHash);
  
          expect(
            await repository.findSessionByTokenHash(
              tokenHash
            )
          ).toMatchObject({
            id: session.id,
            userId: user.id,
            tokenHash,
          });
  
          await repository.deleteSessionByTokenHash(
            tokenHash
          );
  
          expect(
            await repository.findSessionByTokenHash(
              tokenHash
            )
          ).toBeNull();
        }
      );
  
      it(
        "keeps sessions isolated between users",
        async () => {
          const userA =
            await repository.createUser({
              email: emailA,
              passwordHash:
                "test-password-hash-a",
            });
  
          const userB =
            await repository.createUser({
              email: emailB,
              passwordHash:
                "test-password-hash-b",
            });
  
          const tokenHashA =
            hashToken(
              "session-token-a"
            );
  
          const tokenHashB =
            hashToken(
              "session-token-b"
            );
  
          const expiresAt =
            new Date(
              Date.now() +
                60 * 60 * 1000
            );
  
          await repository.createSession(
            userA.id,
            {
              tokenHash:
                tokenHashA,
              expiresAt,
            }
          );
  
          await repository.createSession(
            userB.id,
            {
              tokenHash:
                tokenHashB,
              expiresAt,
            }
          );
  
          await repository.deleteSessionByTokenHash(
            tokenHashA
          );
  
          expect(
            await repository.findSessionByTokenHash(
              tokenHashA
            )
          ).toBeNull();
  
          expect(
            await repository.findSessionByTokenHash(
              tokenHashB
            )
          ).toMatchObject({
            userId: userB.id,
          });
        }
      );
  
      it(
        "deletes sessions that are expired relative to the cleanup time",
        async () => {
          const user =
            await repository.createUser({
              email: emailA,
              passwordHash:
                "test-password-hash-a",
            });
  
          const tokenHash =
            hashToken(
              "expiring-session"
            );
  
          const expiresAt =
            new Date(
              Date.now() +
                60 * 60 * 1000
            );
  
          await repository.createSession(
            user.id,
            {
              tokenHash,
              expiresAt,
            }
          );
  
          const deletedCount =
            await repository.deleteExpiredSessions(
              new Date(
                Date.now() +
                  2 * 60 * 60 * 1000
              )
            );
  
          expect(
            deletedCount
          ).toBe(1);
  
          expect(
            await repository.findSessionByTokenHash(
              tokenHash
            )
          ).toBeNull();
        }
      );
  
      it(
        "rejects session creation for a user that is not an auth account",
        async () => {
          await expect(
            repository.createSession(
              "missing-auth-user",
              {
                tokenHash:
                  hashToken(
                    "missing-user-session"
                  ),
                expiresAt:
                  new Date(
                    Date.now() +
                      60 *
                        60 *
                        1000
                  ),
              }
            )
          ).rejects.toBeInstanceOf(
            AuthUserNotFoundError
          );
        }
      );
    }
  );