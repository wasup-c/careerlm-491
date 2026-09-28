export class PersistenceValidationError extends Error {
    readonly code = "PERSISTENCE_VALIDATION_ERROR";
  
    readonly statusCode = 400;
  
    constructor(message: string) {
      super(message);
  
      this.name = "PersistenceValidationError";
    }
  }
  
  export class PersistenceNotFoundError extends Error {
    readonly code = "PERSISTENCE_NOT_FOUND";
  
    readonly statusCode = 404;
  
    constructor(message: string) {
      super(message);
  
      this.name = "PersistenceNotFoundError";
    }
  }
  
  export class PersistenceCorruptionError extends Error {
    readonly code = "PERSISTENCE_CORRUPTION";
  
    readonly statusCode = 500;
  
    constructor(message: string) {
      super(message);
  
      this.name = "PersistenceCorruptionError";
    }
  }