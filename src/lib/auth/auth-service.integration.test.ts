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
    AuthService,
  } from "./auth-service";
  
  import {
    PostgresAuthRepository,
  } from "./postgres-auth-repository";
  
  import {
    hashSessionToken,
  } from "./session-token";
  
  const databaseUrl =
    process.env.DATABASE_URL?.trim();
  
  const describeDatabase =
    databaseUrl
      ? describe
      : describe.skip;
  
  describeDatabase(
    "AuthService with PostgreSQL",
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
  
      const service =
        new AuthService(
          repository
        );
  
      const email =
        "postgres-auth-service@example.com";
  
      const password =
        "CareerLM-Integration-Password-123!";
  
      async function cleanup() {
        await pool.query(
          `
            DELETE FROM users
            WHERE email = $1
          `,
          [email]
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
        "registers a user, stores only hashes, resolves the session, and logs out",
        async () => {
          const registration =
            await service.register(
              email,
              password
            );
  
          expect(
            registration.user.email
          ).toBe(email);
  
          expect(
            registration.token
          ).not.toBe("");
  
          const userResult =
            await pool.query<{
              email: string;
              password_hash: string;
            }>(
              `
                SELECT
                  email,
                  password_hash
                FROM users
                WHERE id = $1
              `,
              [
                registration.user.id,
              ]
            );
  
          expect(
            userResult.rows
          ).toHaveLength(1);
  
          expect(
            userResult.rows[0]
              .email
          ).toBe(email);
  
          expect(
            userResult.rows[0]
              .password_hash
          ).not.toBe(password);
  
          const tokenHash =
            hashSessionToken(
              registration.token
            );
  
          const sessionResult =
            await pool.query<{
              token_hash: string;
            }>(
              `
                SELECT token_hash
                FROM sessions
                WHERE user_id = $1
              `,
              [
                registration.user.id,
              ]
            );
  
          expect(
            sessionResult.rows
          ).toHaveLength(1);
  
          expect(
            sessionResult.rows[0]
              .token_hash
          ).toBe(tokenHash);
  
          expect(
            sessionResult.rows[0]
              .token_hash
          ).not.toBe(
            registration.token
          );
  
          expect(
            await service.resolveSession(
              registration.token
            )
          ).toEqual(
            registration.user
          );
  
          await service.logout(
            registration.token
          );
  
          expect(
            await service.resolveSession(
              registration.token
            )
          ).toBeNull();
  
          const remainingSessions =
            await pool.query(
              `
                SELECT id
                FROM sessions
                WHERE user_id = $1
              `,
              [
                registration.user.id,
              ]
            );
  
          expect(
            remainingSessions.rowCount
          ).toBe(0);
        }
      );
  
      it(
        "logs into the same persistent account through a recreated service",
        async () => {
          const registration =
            await service.register(
              email,
              password
            );
  
          await service.logout(
            registration.token
          );
  
          const recreatedService =
            new AuthService(
              new PostgresAuthRepository(
                pool
              )
            );
  
          const login =
            await recreatedService.login(
              email,
              password
            );
  
          expect(
            login.user
          ).toEqual(
            registration.user
          );
  
          expect(
            await recreatedService
              .resolveSession(
                login.token
              )
          ).toEqual(
            registration.user
          );
        }
      );
    }
  );