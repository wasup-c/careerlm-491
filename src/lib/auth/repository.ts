import type {
    CreateSessionInput,
    CreateUserInput,
    SessionRecord,
    UserAccountRecord,
  } from "./domain";
  
  export interface AuthRepository {
    createUser(
      input: CreateUserInput
    ): Promise<UserAccountRecord>;
  
    findUserByEmail(
      email: string
    ): Promise<UserAccountRecord | null>;
  
    findUserById(
      userId: string
    ): Promise<UserAccountRecord | null>;
  
    createSession(
      userId: string,
      input: CreateSessionInput
    ): Promise<SessionRecord>;
  
    findSessionByTokenHash(
      tokenHash: string
    ): Promise<SessionRecord | null>;
  
    deleteSessionByTokenHash(
      tokenHash: string
    ): Promise<void>;
  
    deleteExpiredSessions(
      referenceTime?: Date
    ): Promise<number>;
  }