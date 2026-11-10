import bcrypt from "bcryptjs";

import {
  AuthValidationError,
} from "./errors";

const PASSWORD_MIN_LENGTH =
  8;

const PASSWORD_MAX_BYTES =
  72;

const BCRYPT_COST =
  12;

/**
 * Validates a plaintext password before hashing.
 *
 * bcrypt only considers the first 72 bytes of input, so CareerLM
 * rejects passwords exceeding that limit rather than silently
 * truncating security-sensitive input.
 */
export function validatePassword(
  password: string
): void {
  if (
    password.length <
    PASSWORD_MIN_LENGTH
  ) {
    throw new AuthValidationError(
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
    );
  }

  const byteLength =
    Buffer.byteLength(
      password,
      "utf8"
    );

  if (
    byteLength >
    PASSWORD_MAX_BYTES
  ) {
    throw new AuthValidationError(
      `Password must not exceed ${PASSWORD_MAX_BYTES} UTF-8 bytes.`
    );
  }
}

/**
 * Hashes a validated plaintext password using bcrypt.
 */
export async function hashPassword(
  password: string
): Promise<string> {
  validatePassword(password);

  return bcrypt.hash(
    password,
    BCRYPT_COST
  );
}

/**
 * Compares a plaintext password against a stored bcrypt hash.
 *
 * Returns false for malformed or unsupported password input rather
 * than exposing validation details during login.
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  if (
    password.length <
      PASSWORD_MIN_LENGTH ||
    Buffer.byteLength(
      password,
      "utf8"
    ) >
      PASSWORD_MAX_BYTES
  ) {
    return false;
  }

  try {
    return await bcrypt.compare(
      password,
      passwordHash
    );
  } catch {
    return false;
  }
}