// @vitest-environment node

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
  } from "vitest";
  
  import {
    mkdtemp,
    rm,
    writeFile,
  } from "node:fs/promises";
  
  import {
    tmpdir,
  } from "node:os";
  
  import path from "node:path";
  
  import {
    PersistenceCorruptionError,
  } from "./errors";
  
  import {
    JsonFileCareerRepository,
  } from "./json-file-repository";
  
  describe(
    "JsonFileCareerRepository persisted-state validation",
    () => {
      let directory: string;
      let filePath: string;
      let repository:
        JsonFileCareerRepository;
  
      beforeEach(async () => {
        directory =
          await mkdtemp(
            path.join(
              tmpdir(),
              "careerlm-state-validation-"
            )
          );
  
        filePath =
          path.join(
            directory,
            "data.json"
          );
  
        repository =
          new JsonFileCareerRepository(
            filePath
          );
      });
  
      afterEach(async () => {
        await rm(
          directory,
          {
            recursive: true,
            force: true,
          }
        );
      });
  
      it(
        "rejects a questionnaire with invalid persisted weekly hours",
        async () => {
          const state = {
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
                  ],
  
                  learningStyle:
                    "hands-on",
  
                  weeklyHours:
                    -100,
  
                  userId:
                    "demo-user",
  
                  schemaVersion: 1,
  
                  createdAt:
                    "2026-10-11T12:00:00.000Z",
  
                  updatedAt:
                    "2026-10-11T12:00:00.000Z",
                },
              },
            },
          };
  
          await writeFile(
            filePath,
            JSON.stringify(
              state,
              null,
              2
            ),
            "utf8"
          );
  
          await expect(
            repository
              .getQuestionnaire(
                "demo-user"
              )
          ).rejects.toBeInstanceOf(
            PersistenceCorruptionError
          );
        }
      );
  
      it(
        "rejects a roadmap with an invalid persisted milestone status",
        async () => {
          const state = {
            schemaVersion: 1,
  
            users: {
              "demo-user": {
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
                        "Learn core networking concepts.",
  
                      estimatedHours:
                        10,
  
                      skills: [
                        "Networking",
                      ],
  
                      status:
                        "invalid-status",
                    },
                  ],
  
                  createdAt:
                    "2026-10-11T12:00:00.000Z",
  
                  updatedAt:
                    "2026-10-11T12:00:00.000Z",
                },
              },
            },
          };
  
          await writeFile(
            filePath,
            JSON.stringify(
              state,
              null,
              2
            ),
            "utf8"
          );
  
          await expect(
            repository
              .getActiveRoadmap(
                "demo-user"
              )
          ).rejects.toBeInstanceOf(
            PersistenceCorruptionError
          );
        }
      );
    }
  );