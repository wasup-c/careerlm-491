// @vitest-environment node

import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import {
    PersistenceCorruptionError,
  } from "./errors";
  
  import {
    validatePersistenceState,
  } from "./state-validation";
  
  function createValidState() {
    return {
      schemaVersion: 1,
  
      users: {
        "user-a": {
          profile: {
            name:
              "Christian Ramirez",
  
            targetRole:
              "Security Analyst",
  
            experienceLevel:
              "beginner",
  
            userId:
              "user-a",
  
            schemaVersion: 1,
  
            createdAt:
              "2026-10-12T12:00:00.000Z",
  
            updatedAt:
              "2026-10-12T12:30:00.000Z",
          },
        },
      },
    };
  }
  
  describe(
    "persisted profile state validation",
    () => {
      it(
        "accepts a valid persisted profile",
        () => {
          const state =
            createValidState();
  
          expect(
            validatePersistenceState(
              state
            )
          ).toEqual(state);
        }
      );
  
      it(
        "rejects profile ownership mismatch",
        () => {
          const state =
            createValidState();
  
          state.users[
            "user-a"
          ].profile.userId =
            "user-b";
  
          expect(
            () =>
              validatePersistenceState(
                state
              )
          ).toThrow(
            PersistenceCorruptionError
          );
        }
      );
  
      it(
        "rejects unsupported experience level",
        () => {
          const state =
            createValidState();
  
          state.users[
            "user-a"
          ].profile.experienceLevel =
            "expert";
  
          expect(
            () =>
              validatePersistenceState(
                state
              )
          ).toThrow(
            PersistenceCorruptionError
          );
        }
      );
  
      it(
        "rejects non-canonical profile strings",
        () => {
          const state =
            createValidState();
  
          state.users[
            "user-a"
          ].profile.name =
            " Christian Ramirez ";
  
          expect(
            () =>
              validatePersistenceState(
                state
              )
          ).toThrow(
            PersistenceCorruptionError
          );
        }
      );
  
      it(
        "rejects malformed timestamps",
        () => {
          const state =
            createValidState();
  
          state.users[
            "user-a"
          ].profile.updatedAt =
            "not-a-date";
  
          expect(
            () =>
              validatePersistenceState(
                state
              )
          ).toThrow(
            PersistenceCorruptionError
          );
        }
      );
  
      it(
        "rejects updatedAt before createdAt",
        () => {
          const state =
            createValidState();
  
          state.users[
            "user-a"
          ].profile.updatedAt =
            "2026-10-11T12:00:00.000Z";
  
          expect(
            () =>
              validatePersistenceState(
                state
              )
          ).toThrow(
            PersistenceCorruptionError
          );
        }
      );
    }
  );