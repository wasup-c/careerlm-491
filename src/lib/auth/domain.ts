export interface UserAccountRecord {
    readonly id: string;
    readonly email: string;
    readonly passwordHash: string;
    readonly createdAt: string;
    readonly updatedAt: string;
  }
  
  export interface CreateUserInput {
    readonly email: string;
    readonly passwordHash: string;
  }
  
  export interface SessionRecord {
    readonly id: string;
    readonly userId: string;
    readonly tokenHash: string;
    readonly expiresAt: string;
    readonly createdAt: string;
  }
  
  export interface CreateSessionInput {
    readonly tokenHash: string;
    readonly expiresAt: Date;
  }