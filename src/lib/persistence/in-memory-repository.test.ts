import {
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
  
  import {
    InMemoryCareerRepository,
  } from "./in-memory-repository";
  
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
          id: "milestone-1",
          order: 1,
          title: "Networking Fundamentals",
          description:
            "Review foundational networking concepts.",
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
          title: "Linux Fundamentals",
          description:
            "Build practical Linux command-line skills.",
          estimatedHours: 10,
          skills: [
            "Linux",
            "Shell",
          ],
          status: "not-started",
        },
      ],
      ...overrides,
    };
  }
  
  describe(
    "InMemoryCareerRepository",
    () => {
      let repository: InMemoryCareerRepository;
  
      beforeEach(() => {
        repository =
          new InMemoryCareerRepository();
      });
  
      it(
        "saves and retrieves a questionnaire",
        async () => {
          const saved =
            await repository.saveQuestionnaire(
              "user-1",
              createQuestionnaireInput()
            );
  
          const retrieved =
            await repository.getQuestionnaire(
              "user-1"
            );
  
          expect(retrieved).not.toBeNull();
  
          expect(retrieved).toEqual(saved);
  
          expect(
            retrieved?.userId
          ).toBe("user-1");
  
          expect(
            retrieved?.targetRole
          ).toBe("Security Analyst");
  
          expect(
            retrieved?.schemaVersion
          ).toBe(1);
        }
      );
  
      it(
        "normalizes questionnaire data before storing it",
        async () => {
          const saved =
            await repository.saveQuestionnaire(
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
  
          expect(saved.userId).toBe(
            "user-1"
          );
  
          expect(saved.targetRole).toBe(
            "Security Engineer"
          );
  
          expect(saved.learningStyle).toBe(
            "project-based"
          );
  
          expect(saved.existingSkills).toEqual([
            "Linux",
            "Networking",
          ]);
        }
      );
  
      it(
        "replaces a questionnaire while preserving its original createdAt timestamp",
        async () => {
          const first =
            await repository.saveQuestionnaire(
              "user-1",
              createQuestionnaireInput()
            );
  
          const replacement =
            await repository.saveQuestionnaire(
              "user-1",
              createQuestionnaireInput({
                targetRole:
                  "Security Engineer",
                weeklyHours: 15,
              })
            );
  
          expect(
            replacement.targetRole
          ).toBe("Security Engineer");
  
          expect(
            replacement.weeklyHours
          ).toBe(15);
  
          expect(
            replacement.createdAt
          ).toBe(first.createdAt);
        }
      );
  
      it(
        "creates and retrieves an active roadmap",
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
  
          expect(retrieved).not.toBeNull();
  
          expect(retrieved).toEqual(
            created
          );
  
          expect(created.userId).toBe(
            "user-1"
          );
  
          expect(created.title).toBe(
            "Security Analyst Roadmap"
          );
  
          expect(
            created.milestones
          ).toHaveLength(2);
        }
      );
  
      it(
        "replaces the active roadmap for a user",
        async () => {
          const first =
            await repository
              .createOrReplaceRoadmap(
                "user-1",
                createRoadmapInput()
              );
  
          const second =
            await repository
              .createOrReplaceRoadmap(
                "user-1",
                createRoadmapInput({
                  title:
                    "Security Engineer Roadmap",
                  targetRole:
                    "Security Engineer",
                  estimatedWeeks: 12,
                })
              );
  
          const retrieved =
            await repository
              .getActiveRoadmap(
                "user-1"
              );
  
          expect(second.id).not.toBe(
            first.id
          );
  
          expect(retrieved?.id).toBe(
            second.id
          );
  
          expect(
            retrieved?.title
          ).toBe(
            "Security Engineer Roadmap"
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
          ).toBe("not-started");
  
          expect(
            secondMilestone?.status
          ).toBe("in-progress");
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
            repository.updateMilestoneStatus(
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
            repository.saveQuestionnaire(
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
        "keeps data isolated between users",
        async () => {
          await repository.saveQuestionnaire(
            "user-a",
            createQuestionnaireInput({
              targetRole:
                "Security Analyst",
            })
          );
  
          await repository.saveQuestionnaire(
            "user-b",
            createQuestionnaireInput({
              targetRole:
                "Cloud Engineer",
            })
          );
  
          const userA =
            await repository.getQuestionnaire(
              "user-a"
            );
  
          const userB =
            await repository.getQuestionnaire(
              "user-b"
            );
  
          expect(
            userA?.targetRole
          ).toBe("Security Analyst");
  
          expect(
            userB?.targetRole
          ).toBe("Cloud Engineer");
        }
      );
  
      it(
        "resets one user's data without affecting another user",
        async () => {
          await repository.saveQuestionnaire(
            "user-a",
            createQuestionnaireInput()
          );
  
          await repository
            .createOrReplaceRoadmap(
              "user-a",
              createRoadmapInput()
            );
  
          await repository.saveQuestionnaire(
            "user-b",
            createQuestionnaireInput({
              targetRole:
                "Cloud Engineer",
            })
          );
  
          await repository.resetDemoData(
            "user-a"
          );
  
          const userAQuestionnaire =
            await repository.getQuestionnaire(
              "user-a"
            );
  
          const userARoadmap =
            await repository.getActiveRoadmap(
              "user-a"
            );
  
          const userBQuestionnaire =
            await repository.getQuestionnaire(
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
            userBQuestionnaire?.targetRole
          ).toBe("Cloud Engineer");
        }
      );
  
      it(
        "returns cloned data so callers cannot mutate internal repository state",
        async () => {
          const saved =
            await repository.saveQuestionnaire(
              "user-1",
              createQuestionnaireInput()
            );
  
          saved.targetRole =
            "Modified Outside Repository";
  
          saved.existingSkills.push(
            "Injected Skill"
          );
  
          const retrieved =
            await repository.getQuestionnaire(
              "user-1"
            );
  
          expect(
            retrieved?.targetRole
          ).toBe("Security Analyst");
  
          expect(
            retrieved?.existingSkills
          ).not.toContain(
            "Injected Skill"
          );
        }
      );
    }
  );