import {
    getPostgresPool,
  } from "../database/pool";
  
  import {
    AuthService,
  } from "./auth-service";
  
  import {
    PostgresAuthRepository,
  } from "./postgres-auth-repository";
  
  let defaultAuthService:
    AuthService | undefined;
  
  /**
   * Creates CareerLM's default database-backed authentication service.
   *
   * Creation is lazy so importing authentication modules does not require
   * DATABASE_URL until authentication is actually used.
   */
  export function getDefaultAuthService():
    AuthService {
    if (
      defaultAuthService
    ) {
      return defaultAuthService;
    }
  
    const repository =
      new PostgresAuthRepository(
        getPostgresPool()
      );
  
    defaultAuthService =
      new AuthService(
        repository
      );
  
    return defaultAuthService;
  }