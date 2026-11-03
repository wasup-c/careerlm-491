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
          resume: {
            userId:
              "user-a",
  
            schemaVersion: 1,
  
            normalizedText:
              "Synthetic resume content",
  
            sections: {
              education: [
                "B.S. Computer Science",
              ],
  
              experience: [
                "Software Internship",
              ],
  
              skills: [
                "TypeScript",
              ],
  
              projects: [
                "CareerLM",
              ],
            },
  
            createdAt:
              "2026-11-03T17:00:00.000Z",
  
            updatedAt:
              "2026-11-03T17:00:00.000Z",
          },
        },
      },
    };
  }
  
  describe(
    "resume persisted-state validation",
    () => {
      it(
        "accepts a valid persisted resume",
        () => {
          const state =
            createValidState();
  
          expect(
            validatePersistenceState(
              state
            )
          ).toEqual(
            state
          );
        }
      );
  
      it(
        "rejects a resume owned by a different user",
        () => {
          const state =
            createValidState();
  
          state.users[
            "user-a"
          ].resume.userId =
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
        "rejects an unsupported resume schema version",
        () => {
          const state =
            createValidState();
  
          state.users[
            "user-a"
          ].resume.schemaVersion =
            2;
  
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
        "rejects blank persisted resume text",
        () => {
          const state =
            createValidState();
  
          state.users[
            "user-a"
          ].resume.normalizedText =
            "   ";
  
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
        "rejects non-canonical section values",
        () => {
          const state =
            createValidState();
  
          state.users[
            "user-a"
          ].resume.sections.skills = [
            " TypeScript ",
          ];
  
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
        "rejects duplicate persisted section values",
        () => {
          const state =
            createValidState();
  
          state.users[
            "user-a"
          ].resume.sections.skills = [
            "TypeScript",
            "TypeScript",
          ];
  
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
        "rejects an invalid timestamp order",
        () => {
          const state =
            createValidState();
  
          state.users[
            "user-a"
          ].resume.updatedAt =
            "2026-11-03T16:00:00.000Z";
  
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