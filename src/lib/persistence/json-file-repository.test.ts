// @vitest-environment node

import {
    mkdtemp,
    rm,
    writeFile,
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
    PersistenceCorruptionError,
    PersistenceNotFoundError,
    PersistenceValidationError,
  } from "./errors";
  
  import {
    JsonFileCareerRepository,
  } from "./json-file-repository";
  
  function createQuestionnaireInput(
    overrides: Partial<QuestionnaireInput> = {}
  ): QuestionnaireInput {
    return {
      targetRole: "Security Analyst",
      experienceLevel: "beginner",
      existingSkills: [
        "JavaScript",
        "Networking",
      ],
      learningStyle: "hands-on",
      weeklyHours: 10,
      ...overrides,
    };
  }
  
  function createRoadmapInput(
    overrides: Partial<RoadmapInput> = {}
  ): RoadmapInput {
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
            "Review core networking concepts.",
          estimatedHours: 8,
          skills: [
            "TCP/IP",
            "DNS",
          ],
          status: "not-started",
        },
        {
          id: "milestone-2",
          order: 2,
          title: "Security Fundamentals",
          description:
            "Study foundational security concepts.",
          estimatedHours: 10,
          skills: [
            "CIA Triad",
            "Access Control",
          ],
          status: "not-started",
        },
      ],
      ...overrides,
    };
  }
  
  describe(
    "JsonFileCareerRepository",
    () => {
      let temporaryDirectory: string;
      let dataFilePath: string;
      let repository: JsonFileCareerRepository;
  
      beforeEach(async () => {
        temporaryDirectory =
          await mkdtemp(
            path.join(
              tmpdir(),
              "careerlm-persistence-test-"
            )
          );
  
        dataFilePath =
          path.join(
            temporaryDirectory,
            "data.json"
          );
  
        repository =
          new JsonFileCareerRepository(
            dataFilePath
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
        "saves and retrieves a questionnaire",
        async () => {
          const input =
            createQuestionnaireInput({
              targetRole:
                "  Security Analyst  ",
              existingSkills: [
                " JavaScript ",
                "Networking",
                "JavaScript",
              ],
            });
  
          const saved =
            await repository.saveQuestionnaire(
              "user-1",
              input
            );
  
          const retrieved =
            await repository.getQuestionnaire(
              "user-1"
            );
  
          expect(saved.userId).toBe(
            "user-1"
          );
  
          expect(saved.targetRole).toBe(
            "Security Analyst"
          );
  
          expect(
            saved.existingSkills
          ).toEqual([
            "JavaScript",
            "Networking",
          ]);
  
          expect(saved.schemaVersion).toBe(
            1
          );
  
          expect(saved.createdAt).toBeTruthy();
          expect(saved.updatedAt).toBeTruthy();
  
          expect(retrieved).not.toBeNull();
  
          expect(
            retrieved?.targetRole
          ).toBe(
            "Security Analyst"
          );
  
          expect(
            retrieved?.experienceLevel
          ).toBe(
            "beginner"
          );
  
          expect(
            retrieved?.weeklyHours
          ).toBe(
            10
          );
        }
      );
  
      it(
        "replaces an existing questionnaire for the same user",
        async () => {
          const first =
            await repository.saveQuestionnaire(
              "user-1",
              createQuestionnaireInput({
                targetRole:
                  "SOC Analyst",
              })
            );
  
          const second =
            await repository.saveQuestionnaire(
              "user-1",
              createQuestionnaireInput({
                targetRole:
                  "Security Engineer",
                weeklyHours: 15,
              })
            );
  
          const retrieved =
            await repository.getQuestionnaire(
              "user-1"
            );
  
          expect(second.createdAt).toBe(
            first.createdAt
          );
  
          expect(
            retrieved?.targetRole
          ).toBe(
            "Security Engineer"
          );
  
          expect(
            retrieved?.weeklyHours
          ).toBe(
            15
          );
        }
      );
  
      it(
        "creates and retrieves an active roadmap",
        async () => {
          const input =
            createRoadmapInput({
              milestones: [
                {
                  id: "milestone-2",
                  order: 2,
                  title:
                    "Security Fundamentals",
                  description:
                    "Study security fundamentals.",
                  estimatedHours: 10,
                  skills: [
                    "Access Control",
                  ],
                  status:
                    "not-started",
                },
                {
                  id: "milestone-1",
                  order: 1,
                  title:
                    "Networking Fundamentals",
                  description:
                    "Study networking fundamentals.",
                  estimatedHours: 8,
                  skills: [
                    "TCP/IP",
                  ],
                  status:
                    "not-started",
                },
              ],
            });
  
          const saved =
            await repository
              .createOrReplaceRoadmap(
                "user-1",
                input
              );
  
          const retrieved =
            await repository
              .getActiveRoadmap(
                "user-1"
              );
  
          expect(saved.userId).toBe(
            "user-1"
          );
  
          expect(saved.id).toBeTruthy();
  
          expect(
            saved.milestones
          ).toHaveLength(2);
  
          expect(
            saved.milestones[0].id
          ).toBe(
            "milestone-1"
          );
  
          expect(
            saved.milestones[1].id
          ).toBe(
            "milestone-2"
          );
  
          expect(retrieved?.id).toBe(
            saved.id
          );
  
          expect(
            retrieved?.title
          ).toBe(
            "Security Analyst Roadmap"
          );
        }
      );
  
      it(
        "replaces the active roadmap for the same user",
        async () => {
          const first =
            await repository
              .createOrReplaceRoadmap(
                "user-1",
                createRoadmapInput({
                  title:
                    "First Roadmap",
                })
              );
  
          const second =
            await repository
              .createOrReplaceRoadmap(
                "user-1",
                createRoadmapInput({
                  title:
                    "Replacement Roadmap",
                })
              );
  
          const active =
            await repository
              .getActiveRoadmap(
                "user-1"
              );
  
          expect(second.id).not.toBe(
            first.id
          );
  
          expect(active?.id).toBe(
            second.id
          );
  
          expect(active?.title).toBe(
            "Replacement Roadmap"
          );
        }
      );
  
      it(
        "updates only the requested milestone status",
        async () => {
          await repository
            .createOrReplaceRoadmap(
              "user-1",
              createRoadmapInput()
            );
  
          const updated =
            await repository
              .updateMilestoneStatus(
                "user-1",
                "milestone-1",
                "completed"
              );
  
          const firstMilestone =
            updated.milestones.find(
              (milestone) =>
                milestone.id ===
                "milestone-1"
            );
  
          const secondMilestone =
            updated.milestones.find(
              (milestone) =>
                milestone.id ===
                "milestone-2"
            );
  
          expect(
            firstMilestone?.status
          ).toBe(
            "completed"
          );
  
          expect(
            secondMilestone?.status
          ).toBe(
            "not-started"
          );
        }
      );
  
      it(
        "rejects an unknown milestone ID",
        async () => {
          await repository
            .createOrReplaceRoadmap(
              "user-1",
              createRoadmapInput()
            );
  
          await expect(
            repository
              .updateMilestoneStatus(
                "user-1",
                "does-not-exist",
                "completed"
              )
          ).rejects.toBeInstanceOf(
            PersistenceNotFoundError
          );
        }
      );
  
      it(
        "rejects invalid questionnaire input",
        async () => {
          const invalidInput =
            createQuestionnaireInput({
              weeklyHours: 0,
            });
  
          await expect(
            repository
              .saveQuestionnaire(
                "user-1",
                invalidInput
              )
          ).rejects.toBeInstanceOf(
            PersistenceValidationError
          );
        }
      );
  
      it(
        "keeps different users' persisted data isolated",
        async () => {
          await repository
            .saveQuestionnaire(
              "user-a",
              createQuestionnaireInput({
                targetRole:
                  "Security Analyst",
              })
            );
  
          await repository
            .saveQuestionnaire(
              "user-b",
              createQuestionnaireInput({
                targetRole:
                  "Cloud Engineer",
              })
            );
  
          const userA =
            await repository
              .getQuestionnaire(
                "user-a"
              );
  
          const userB =
            await repository
              .getQuestionnaire(
                "user-b"
              );
  
          expect(
            userA?.targetRole
          ).toBe(
            "Security Analyst"
          );
  
          expect(
            userB?.targetRole
          ).toBe(
            "Cloud Engineer"
          );
  
          expect(
            userA?.userId
          ).toBe(
            "user-a"
          );
  
          expect(
            userB?.userId
          ).toBe(
            "user-b"
          );
        }
      );
  
      it(
        "resets one user's data without affecting another user",
        async () => {
          await repository
            .saveQuestionnaire(
              "user-a",
              createQuestionnaireInput()
            );
  
          await repository
            .createOrReplaceRoadmap(
              "user-a",
              createRoadmapInput()
            );
  
          await repository
            .saveQuestionnaire(
              "user-b",
              createQuestionnaireInput({
                targetRole:
                  "Cloud Engineer",
              })
            );
  
          await repository
            .createOrReplaceRoadmap(
              "user-b",
              createRoadmapInput({
                title:
                  "Cloud Engineer Roadmap",
                targetRole:
                  "Cloud Engineer",
              })
            );
  
          await repository
            .resetDemoData(
              "user-a"
            );
  
          const userAQuestionnaire =
            await repository
              .getQuestionnaire(
                "user-a"
              );
  
          const userARoadmap =
            await repository
              .getActiveRoadmap(
                "user-a"
              );
  
          const userBQuestionnaire =
            await repository
              .getQuestionnaire(
                "user-b"
              );
  
          const userBRoadmap =
            await repository
              .getActiveRoadmap(
                "user-b"
              );
  
          expect(
            userAQuestionnaire
          ).toBeNull();
  
          expect(
            userARoadmap
          ).toBeNull();
  
          expect(
            userBQuestionnaire
          ).not.toBeNull();
  
          expect(
            userBRoadmap
          ).not.toBeNull();
  
          expect(
            userBQuestionnaire?.targetRole
          ).toBe(
            "Cloud Engineer"
          );
  
          expect(
            userBRoadmap?.title
          ).toBe(
            "Cloud Engineer Roadmap"
          );
        }
      );
  
      it(
        "persists data across repository instances",
        async () => {
          const firstRepository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          await firstRepository
            .saveQuestionnaire(
              "user-1",
              createQuestionnaireInput({
                targetRole:
                  "Penetration Tester",
              })
            );
  
          await firstRepository
            .createOrReplaceRoadmap(
              "user-1",
              createRoadmapInput({
                title:
                  "Penetration Testing Roadmap",
                targetRole:
                  "Penetration Tester",
              })
            );
  
          const secondRepository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          const questionnaire =
            await secondRepository
              .getQuestionnaire(
                "user-1"
              );
  
          const roadmap =
            await secondRepository
              .getActiveRoadmap(
                "user-1"
              );
  
          expect(
            questionnaire?.targetRole
          ).toBe(
            "Penetration Tester"
          );
  
          expect(
            roadmap?.title
          ).toBe(
            "Penetration Testing Roadmap"
          );
        }
      );
  
      it(
        "reports corrupted persistence JSON with a controlled error",
        async () => {
          await writeFile(
            dataFilePath,
            "{ this is not valid json",
            "utf8"
          );
  
          await expect(
            repository
              .getQuestionnaire(
                "user-1"
              )
          ).rejects.toBeInstanceOf(
            PersistenceCorruptionError
          );
        }
      );
    }
  );