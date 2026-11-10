import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import {
    SESSION_DURATION_MS,
    createSessionExpiration,
    generateSessionToken,
    hashSessionToken,
  } from "./session-token";
  
  describe(
    "CareerLM session token utilities",
    () => {
      it(
        "generates unique random session tokens",
        () => {
          const first =
            generateSessionToken();
  
          const second =
            generateSessionToken();
  
          expect(first).not.toBe(
            second
          );
  
          expect(
            first.length
          ).toBeGreaterThan(30);
  
          expect(
            second.length
          ).toBeGreaterThan(30);
        }
      );
  
      it(
        "hashes a raw session token into a 64-character SHA-256 value",
        () => {
          const token =
            generateSessionToken();
  
          const hash =
            hashSessionToken(
              token
            );
  
          expect(hash).toMatch(
            /^[0-9a-f]{64}$/
          );
  
          expect(hash).not.toBe(
            token
          );
        }
      );
  
      it(
        "hashes the same token deterministically",
        () => {
          const token =
            "test-session-token";
  
          expect(
            hashSessionToken(
              token
            )
          ).toBe(
            hashSessionToken(
              token
            )
          );
        }
      );
  
      it(
        "creates a seven-day session expiration",
        () => {
          const now =
            new Date(
              "2026-11-09T20:00:00.000Z"
            );
  
          const expiration =
            createSessionExpiration(
              now
            );
  
          expect(
            expiration.getTime() -
              now.getTime()
          ).toBe(
            SESSION_DURATION_MS
          );
        }
      );
    }
  );