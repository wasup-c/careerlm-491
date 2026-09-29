// @vitest-environment node

import {
    mkdtemp,
    rm,
  } from "node:fs/promises";
  import { tmpdir } from "node:os";
  import path from "node:path";
  
  import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
  } from "vitest";
  
  import type {
    QuestionnaireInput,
    RoadmapInput,
  } from "./domain";
  
  import {
    JsonFileCareerRepository,
  } from "./json-file-repository";
  
  function createQuestionnaire(
    targetRole: string
  ): QuestionnaireInput {
    return {
      targetRole,
      experienceLevel: "beginner",
      existingSkills: [
        "Networking",
      ],
      learningStyle: "hands-on",
      weeklyHours: 10,
    };
  }
  
  function createRoadmap(): RoadmapInput {
    return {
      title: "Security Analyst Roadmap",
      targetRole: "Security Analyst",
      estimatedWeeks: 8,
      milestones: [
        {
          id: "milestone-1",
          order: 1,
          title: "Networking Fundamentals",
          description:
            "Learn foundational networking concepts.",
          estimatedHours: 8,
          skills: [
            "TCP/IP",
            "DNS",
          ],
          status: "not-started",
        },
      ],
    };
  }
  
  describe(
    "JsonFileCareerRepository concurrency",
    () => {
      let temporaryDirectory: string;
      let dataFilePath: string;
  
      beforeEach(async () => {
        temporaryDirectory =
          await mkdtemp(
            path.join(
              tmpdir(),
              "careerlm-concurrency-test-"
            )
          );
  
        dataFilePath =
          path.join(
            temporaryDirectory,
            "data.json"
          );
      });
  
      afterEach(async () => {
        await rm(
          temporaryDirectory,
          {
            recursive: true,
            force: true,
          }
        );
      });
  
      it(
        "preserves concurrent questionnaire writes from repository instances sharing the same file",
        async () => {
          const users =
            Array.from(
              { length: 25 },
              (_, index) => ({
                userId:
                  `concurrent-user-${index + 1}`,
  
                targetRole:
                  `Career Role ${index + 1}`,
              })
            );
  
          await Promise.all(
            users.map(
              ({
                userId,
                targetRole,
              }) => {
                const repository =
                  new JsonFileCareerRepository(
                    dataFilePath
                  );
  
                return repository
                  .saveQuestionnaire(
                    userId,
                    createQuestionnaire(
                      targetRole
                    )
                  );
              }
            )
          );
  
          const reader =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          const persistedUsers =
            await Promise.all(
              users.map(
                ({ userId }) =>
                  reader.getQuestionnaire(
                    userId
                  )
              )
            );
  
          expect(
            persistedUsers
          ).toHaveLength(
            users.length
          );
  
          for (
            let index = 0;
            index < users.length;
            index += 1
          ) {
            expect(
              persistedUsers[index]
            ).not.toBeNull();
  
            expect(
              persistedUsers[index]?.userId
            ).toBe(
              users[index].userId
            );
  
            expect(
              persistedUsers[index]
                ?.targetRole
            ).toBe(
              users[index].targetRole
            );
          }
        }
      );
  
      it(
        "preserves questionnaire and roadmap writes made concurrently for the same user",
        async () => {
          const questionnaireRepository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          const roadmapRepository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          await Promise.all([
            questionnaireRepository
              .saveQuestionnaire(
                "shared-user",
                createQuestionnaire(
                  "Security Analyst"
                )
              ),
  
            roadmapRepository
              .createOrReplaceRoadmap(
                "shared-user",
                createRoadmap()
              ),
          ]);
  
          const reader =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          const questionnaire =
            await reader
              .getQuestionnaire(
                "shared-user"
              );
  
          const roadmap =
            await reader
              .getActiveRoadmap(
                "shared-user"
              );
  
          expect(
            questionnaire
          ).not.toBeNull();
  
          expect(
            roadmap
          ).not.toBeNull();
  
          expect(
            questionnaire?.targetRole
          ).toBe(
            "Security Analyst"
          );
  
          expect(
            roadmap?.title
          ).toBe(
            "Security Analyst Roadmap"
          );
        }
      );
    }
  );