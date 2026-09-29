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
    PersistenceNotFoundError,
    PersistenceValidationError,
  } from "./errors";
  
  import type {
    CareerRepository,
  } from "./repository";
  
  export interface CareerRepositoryTestFixture {
    repository: CareerRepository;
  
    cleanup?: () =>
      Promise<void> | void;
  }
  
  export type CareerRepositoryTestFactory =
    () =>
      | CareerRepositoryTestFixture
      | Promise<CareerRepositoryTestFixture>;
  
  function createQuestionnaireInput(
    overrides: Partial<QuestionnaireInput> = {}
  ): QuestionnaireInput {
    return {
      targetRole: "Security Analyst",
  
      experienceLevel: "beginner",
  
      existingSkills: [
        "Networking",
        "Linux",
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
          id: "milestone-2",
  
          order: 2,
  
          title: "Linux Fundamentals",
  
          description:
            "Build practical Linux skills.",
  
          estimatedHours: 10,
  
          skills: [
            "Linux",
            "Shell",
          ],
  
          status: "not-started",
        },
        {
          id: "milestone-1",
  
          order: 1,
  
          title: "Networking Fundamentals",
  
          description:
            "Review networking fundamentals.",
  
          estimatedHours: 8,
  
          skills: [
            "TCP/IP",
            "DNS",
          ],
  
          status: "not-started",
        },
      ],
  
      ...overrides,
    };
  }
  
  /**
   * Runs the shared behavioral contract for any CareerRepository
   * implementation.
   *
   * Repository-specific behavior such as JSON corruption handling,
   * filesystem persistence, or write concurrency should remain in
   * adapter-specific test files.
   */
  export function runCareerRepositoryContract(
    implementationName: string,
    createFixture: CareerRepositoryTestFactory
  ): void {
    describe(
      `${implementationName} CareerRepository contract`,
      () => {
        let repository: CareerRepository;
  
        let cleanup:
          | (() => Promise<void> | void)
          | undefined;
  
        beforeEach(async () => {
          const fixture =
            await createFixture();
  
          repository =
            fixture.repository;
  
          cleanup =
            fixture.cleanup;
        });
  
        afterEach(async () => {
          if (cleanup) {
            await cleanup();
          }
  
          cleanup = undefined;
        });
  
        it(
          "saves and retrieves normalized questionnaire data",
          async () => {
            const saved =
              await repository
                .saveQuestionnaire(
                  "  user-1  ",
                  createQuestionnaireInput({
                    targetRole:
                      "  Security Engineer  ",
  
                    existingSkills: [
                      " Linux ",
                      "Linux",
                      "",
                      "Networking",
                    ],
  
                    learningStyle:
                      "  project-based  ",
                  })
                );
  
            const retrieved =
              await repository
                .getQuestionnaire(
                  "user-1"
                );
  
            expect(
              retrieved
            ).not.toBeNull();
  
            expect(
              retrieved?.userId
            ).toBe("user-1");
  
            expect(
              retrieved?.targetRole
            ).toBe(
              "Security Engineer"
            );
  
            expect(
              retrieved?.learningStyle
            ).toBe(
              "project-based"
            );
  
            expect(
              retrieved?.existingSkills
            ).toEqual([
              "Linux",
              "Networking",
            ]);
  
            expect(
              retrieved
            ).toEqual(saved);
          }
        );
  
        it(
          "replaces questionnaire data while preserving createdAt",
          async () => {
            const first =
              await repository
                .saveQuestionnaire(
                  "user-1",
                  createQuestionnaireInput()
                );
  
            const replacement =
              await repository
                .saveQuestionnaire(
                  "user-1",
                  createQuestionnaireInput({
                    targetRole:
                      "Cloud Security Engineer",
  
                    weeklyHours: 15,
                  })
                );
  
            expect(
              replacement.targetRole
            ).toBe(
              "Cloud Security Engineer"
            );
  
            expect(
              replacement.weeklyHours
            ).toBe(15);
  
            expect(
              replacement.createdAt
            ).toBe(first.createdAt);
  
            const retrieved =
              await repository
                .getQuestionnaire(
                  "user-1"
                );
  
            expect(
              retrieved?.targetRole
            ).toBe(
              "Cloud Security Engineer"
            );
          }
        );
  
        it(
          "creates and retrieves a normalized active roadmap",
          async () => {
            const created =
              await repository
                .createOrReplaceRoadmap(
                  "user-1",
                  createRoadmapInput()
                );
  
            const retrieved =
              await repository
                .getActiveRoadmap(
                  "user-1"
                );
  
            expect(
              retrieved
            ).not.toBeNull();
  
            expect(
              retrieved
            ).toEqual(created);
  
            expect(
              retrieved?.userId
            ).toBe("user-1");
  
            expect(
              retrieved?.title
            ).toBe(
              "Security Analyst Roadmap"
            );
  
            expect(
              retrieved?.milestones
            ).toHaveLength(2);
  
            expect(
              retrieved?.milestones.map(
                (milestone) =>
                  milestone.order
              )
            ).toEqual([
              1,
              2,
            ]);
  
            expect(
              retrieved?.milestones[0].id
            ).toBe(
              "milestone-1"
            );
  
            expect(
              retrieved?.milestones[1].id
            ).toBe(
              "milestone-2"
            );
          }
        );
  
        it(
          "replaces the active roadmap",
          async () => {
            const first =
              await repository
                .createOrReplaceRoadmap(
                  "user-1",
                  createRoadmapInput()
                );
  
            const replacement =
              await repository
                .createOrReplaceRoadmap(
                  "user-1",
                  createRoadmapInput({
                    title:
                      "Cloud Security Roadmap",
  
                    targetRole:
                      "Cloud Security Engineer",
  
                    estimatedWeeks: 12,
                  })
                );
  
            const retrieved =
              await repository
                .getActiveRoadmap(
                  "user-1"
                );
  
            expect(
              replacement.id
            ).not.toBe(first.id);
  
            expect(
              retrieved?.id
            ).toBe(
              replacement.id
            );
  
            expect(
              retrieved?.title
            ).toBe(
              "Cloud Security Roadmap"
            );
  
            expect(
              retrieved?.estimatedWeeks
            ).toBe(12);
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
                  "milestone-2",
                  "in-progress"
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
              "not-started"
            );
  
            expect(
              secondMilestone?.status
            ).toBe(
              "in-progress"
            );
          }
        );
  
        it(
          "throws PersistenceNotFoundError for an unknown milestone",
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
                  "missing-milestone",
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
            await expect(
              repository
                .saveQuestionnaire(
                  "user-1",
                  createQuestionnaireInput({
                    weeklyHours: 0,
                  })
                )
            ).rejects.toBeInstanceOf(
              PersistenceValidationError
            );
          }
        );
  
        it(
          "keeps user data isolated",
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
          }
        );
  
        it(
          "resets only the requested user's data",
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
              userBQuestionnaire
                ?.targetRole
            ).toBe(
              "Cloud Engineer"
            );
          }
        );
  
        it(
          "returns defensive copies instead of exposing internal state",
          async () => {
            await repository
              .saveQuestionnaire(
                "user-1",
                createQuestionnaireInput()
              );
  
            const firstRead =
              await repository
                .getQuestionnaire(
                  "user-1"
                );
  
            expect(
              firstRead
            ).not.toBeNull();
  
            if (!firstRead) {
              throw new Error(
                "Expected questionnaire."
              );
            }
  
            firstRead.targetRole =
              "Modified Outside Repository";
  
            firstRead.existingSkills.push(
              "Injected Skill"
            );
  
            const secondRead =
              await repository
                .getQuestionnaire(
                  "user-1"
                );
  
            expect(
              secondRead?.targetRole
            ).toBe(
              "Security Analyst"
            );
  
            expect(
              secondRead?.existingSkills
            ).not.toContain(
              "Injected Skill"
            );
          }
        );
      }
    );
  }