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
  
  type MutableRecord =
    Record<string, unknown>;
  
  interface MutableUserState {
    questionnaire?:
      MutableRecord;
  
    activeRoadmap?:
      MutableRecord;
  }
  
  interface MutableTestState {
    schemaVersion:
      unknown;
  
    users:
      Record<
        string,
        MutableUserState
      >;
  }
  
  function createValidState():
    MutableTestState {
    return {
      schemaVersion: 1,
  
      users: {
        "demo-user": {
          questionnaire: {
            targetRole:
              "Security Analyst",
  
            experienceLevel:
              "beginner",
  
            existingSkills: [
              "Linux",
              "Networking",
            ],
  
            learningStyle:
              "hands-on",
  
            weeklyHours: 10,
  
            additionalResponses: {
              targetTimeline:
                "6 months",
  
              remoteOnly:
                false,
            },
  
            userId:
              "demo-user",
  
            schemaVersion: 1,
  
            createdAt:
              "2026-10-11T12:00:00.000Z",
  
            updatedAt:
              "2026-10-11T12:30:00.000Z",
          },
  
          activeRoadmap: {
            id:
              "roadmap-1",
  
            userId:
              "demo-user",
  
            title:
              "Security Analyst Roadmap",
  
            targetRole:
              "Security Analyst",
  
            estimatedWeeks: 8,
  
            milestones: [
              {
                id:
                  "milestone-1",
  
                order: 1,
  
                title:
                  "Networking Fundamentals",
  
                description:
                  "Review networking fundamentals.",
  
                estimatedHours:
                  8,
  
                skills: [
                  "TCP/IP",
                  "DNS",
                ],
  
                status:
                  "not-started",
              },
  
              {
                id:
                  "milestone-2",
  
                order: 2,
  
                title:
                  "Linux Fundamentals",
  
                description:
                  "Develop Linux command-line skills.",
  
                estimatedHours:
                  10,
  
                skills: [
                  "Linux",
                  "Shell",
                ],
  
                status:
                  "in-progress",
              },
            ],
  
            createdAt:
              "2026-10-11T12:00:00.000Z",
  
            updatedAt:
              "2026-10-11T12:30:00.000Z",
          },
        },
      },
    };
  }
  
  function requireDemoUser(
    state: MutableTestState
  ): MutableUserState {
    const user =
      state.users[
        "demo-user"
      ];
  
    if (!user) {
      throw new Error(
        "Expected demo-user fixture."
      );
    }
  
    return user;
  }
  
  function requireQuestionnaire(
    state: MutableTestState
  ): MutableRecord {
    const questionnaire =
      requireDemoUser(
        state
      ).questionnaire;
  
    if (!questionnaire) {
      throw new Error(
        "Expected questionnaire fixture."
      );
    }
  
    return questionnaire;
  }
  
  function requireRoadmap(
    state: MutableTestState
  ): MutableRecord {
    const roadmap =
      requireDemoUser(
        state
      ).activeRoadmap;
  
    if (!roadmap) {
      throw new Error(
        "Expected roadmap fixture."
      );
    }
  
    return roadmap;
  }
  
  function requireMilestones(
    state: MutableTestState
  ): MutableRecord[] {
    const milestones =
      requireRoadmap(
        state
      ).milestones;
  
    if (
      !Array.isArray(
        milestones
      )
    ) {
      throw new Error(
        "Expected milestone fixtures."
      );
    }
  
    return milestones as
      MutableRecord[];
  }
  
  describe(
    "validatePersistenceState",
    () => {
      it(
        "accepts valid persisted CareerLM state",
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
        "accepts an empty users object",
        () => {
          const state = {
            schemaVersion: 1,
            users: {},
          };
  
          expect(
            validatePersistenceState(
              state
            )
          ).toEqual(state);
        }
      );
  
      it(
        "rejects a non-object persistence root",
        () => {
          expect(
            () =>
              validatePersistenceState(
                "invalid"
              )
          ).toThrow(
            PersistenceCorruptionError
          );
        }
      );
  
      it(
        "rejects an unsupported root schema version",
        () => {
          const state =
            createValidState();
  
          state.schemaVersion =
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
        "rejects an invalid persisted user ID",
        () => {
          const state =
            createValidState();
  
          state.users[
            " demo-user "
          ] =
            state.users[
              "demo-user"
            ];
  
          delete state.users[
            "demo-user"
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
        "rejects questionnaire ownership that does not match the user entry",
        () => {
          const state =
            createValidState();
  
          requireQuestionnaire(
            state
          ).userId =
            "other-user";
  
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
        "rejects an invalid persisted questionnaire experience level",
        () => {
          const state =
            createValidState();
  
          requireQuestionnaire(
            state
          ).experienceLevel =
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
        "rejects persisted questionnaire weekly hours outside the supported range",
        () => {
          const state =
            createValidState();
  
          requireQuestionnaire(
            state
          ).weeklyHours =
            169;
  
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
        "rejects unsupported additional response values",
        () => {
          const state =
            createValidState();
  
          requireQuestionnaire(
            state
          ).additionalResponses =
            {
              nestedObject: {
                unexpected:
                  true,
              },
            };
  
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
        "rejects roadmap ownership that does not match the user entry",
        () => {
          const state =
            createValidState();
  
          requireRoadmap(
            state
          ).userId =
            "other-user";
  
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
        "rejects a roadmap with a missing persisted ID",
        () => {
          const state =
            createValidState();
  
          requireRoadmap(
            state
          ).id =
            "";
  
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
        "rejects duplicate persisted milestone IDs",
        () => {
          const state =
            createValidState();
  
          const milestones =
            requireMilestones(
              state
            );
  
          milestones[1].id =
            milestones[0].id;
  
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
        "rejects duplicate persisted milestone order values",
        () => {
          const state =
            createValidState();
  
          const milestones =
            requireMilestones(
              state
            );
  
          milestones[1].order =
            milestones[0].order;
  
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
        "rejects an invalid persisted milestone status",
        () => {
          const state =
            createValidState();
  
          requireMilestones(
            state
          )[0].status =
            "blocked";
  
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
        "rejects milestones that are no longer stored in order",
        () => {
          const state =
            createValidState();
  
          const milestones =
            requireMilestones(
              state
            );
  
          milestones[0].order =
            2;
  
          milestones[1].order =
            1;
  
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
        "rejects malformed persisted timestamps",
        () => {
          const state =
            createValidState();
  
          requireRoadmap(
            state
          ).updatedAt =
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
        "rejects an updated timestamp earlier than the created timestamp",
        () => {
          const state =
            createValidState();
  
          requireQuestionnaire(
            state
          ).updatedAt =
            "2026-10-10T12:00:00.000Z";
  
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