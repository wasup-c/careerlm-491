export type {
  CurrentUser,
  CurrentUserProvider,
} from "./current-user-provider";

export {
  ConfiguredCurrentUserProvider,
} from "./configured-current-user-provider";

/**
 * Retained for automated tests and explicit synthetic fixtures.
 * Runtime application composition no longer defaults to this provider.
 */
export {
  DemoCurrentUserProvider,
} from "./demo-current-user-provider";

export {
  AuthenticationRequiredError,
} from "./errors";

export {
  requireCurrentUser,
} from "./require-current-user";