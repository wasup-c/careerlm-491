import {
    AuthValidationError,
  } from "./errors";
  
  export function normalizeEmail(
    email: string
  ): string {
    const normalized =
      email.trim().toLowerCase();
  
    if (
      normalized.length < 3 ||
      normalized.length > 254
    ) {
      throw new AuthValidationError(
        "Email must be between 3 and 254 characters."
      );
    }
  
    const atIndex =
      normalized.indexOf("@");
  
    if (
      atIndex <= 0 ||
      atIndex !==
        normalized.lastIndexOf(
          "@"
        ) ||
      atIndex ===
        normalized.length - 1
    ) {
      throw new AuthValidationError(
        "A valid email address is required."
      );
    }
  
    return normalized;
  }
  
  export function normalizeAuthUserId(
    userId: string
  ): string {
    const normalized =
      userId.trim();
  
    if (
      normalized.length < 1 ||
      normalized.length > 128
    ) {
      throw new AuthValidationError(
        "User ID must be between 1 and 128 characters."
      );
    }
  
    return normalized;
  }
  
  export function normalizePasswordHash(
    passwordHash: string
  ): string {
    const normalized =
      passwordHash.trim();
  
    if (!normalized) {
      throw new AuthValidationError(
        "Password hash is required."
      );
    }
  
    return normalized;
  }
  
  export function normalizeTokenHash(
    tokenHash: string
  ): string {
    const normalized =
      tokenHash
        .trim()
        .toLowerCase();
  
    if (
      !/^[0-9a-f]{64}$/.test(
        normalized
      )
    ) {
      throw new AuthValidationError(
        "Session token hash must be a 64-character hexadecimal SHA-256 hash."
      );
    }
  
    return normalized;
  }
  
  export function normalizeSessionExpiration(
    expiresAt: Date
  ): Date {
    if (
      Number.isNaN(
        expiresAt.getTime()
      )
    ) {
      throw new AuthValidationError(
        "Session expiration must be a valid date."
      );
    }
  
    if (
      expiresAt.getTime() <=
      Date.now()
    ) {
      throw new AuthValidationError(
        "Session expiration must be in the future."
      );
    }
  
    return new Date(
      expiresAt.getTime()
    );
  }