import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import {
    AuthValidationError,
  } from "./errors";
  
  import {
    hashPassword,
    validatePassword,
    verifyPassword,
  } from "./password";
  
  describe(
    "CareerLM password utilities",
    () => {
      it(
        "hashes and verifies a valid password",
        async () => {
          const password =
            "CareerLM-Test-Password-123!";
  
          const hash =
            await hashPassword(
              password
            );
  
          expect(hash).not.toBe(
            password
          );
  
          expect(
            await verifyPassword(
              password,
              hash
            )
          ).toBe(true);
  
          expect(
            await verifyPassword(
              "Wrong-Password-123!",
              hash
            )
          ).toBe(false);
        }
      );
  
      it(
        "generates different hashes for the same password",
        async () => {
          const password =
            "CareerLM-Test-Password-123!";
  
          const first =
            await hashPassword(
              password
            );
  
          const second =
            await hashPassword(
              password
            );
  
          expect(first).not.toBe(
            second
          );
  
          expect(
            await verifyPassword(
              password,
              first
            )
          ).toBe(true);
  
          expect(
            await verifyPassword(
              password,
              second
            )
          ).toBe(true);
        }
      );
  
      it(
        "rejects passwords shorter than eight characters",
        () => {
          expect(
            () =>
              validatePassword(
                "short"
              )
          ).toThrow(
            AuthValidationError
          );
        }
      );
  
      it(
        "rejects passwords exceeding 72 UTF-8 bytes",
        () => {
          const password =
            "é".repeat(37);
  
          expect(
            Buffer.byteLength(
              password,
              "utf8"
            )
          ).toBeGreaterThan(72);
  
          expect(
            () =>
              validatePassword(
                password
              )
          ).toThrow(
            AuthValidationError
          );
        }
      );
  
      it(
        "allows a password exactly 72 UTF-8 bytes",
        () => {
          const password =
            "a".repeat(72);
  
          expect(
            Buffer.byteLength(
              password,
              "utf8"
            )
          ).toBe(72);
  
          expect(
            () =>
              validatePassword(
                password
              )
          ).not.toThrow();
        }
      );
  
      it(
        "returns false instead of throwing for invalid login password input",
        async () => {
          const hash =
            await hashPassword(
              "CareerLM-Test-Password-123!"
            );
  
          expect(
            await verifyPassword(
              "x",
              hash
            )
          ).toBe(false);
  
          expect(
            await verifyPassword(
              "a".repeat(73),
              hash
            )
          ).toBe(false);
        }
      );
    }
  );