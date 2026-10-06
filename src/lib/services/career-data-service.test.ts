// @vitest-environment node

import {
    beforeEach,
    describe,
    expect,
    it,
  } from "vitest";
  
  import type {
    CurrentUser,
    CurrentUserProvider,
  } from "../auth/current-user-provider";
  
  import {
    AuthenticationRequiredError,
  } from "../auth/errors";
  
  import type {
    QuestionnaireInput,
    RoadmapInput,
  } from "../persistence/domain";
  
  import {
    PersistenceNotFoundError,
  } from "../persistence/errors";
  
  import {
    InMemoryCareerRepository,
  } from "../persistence/in-memory-repository";
  
  import {
    CareerDataService,
  } from "./career-data-service";
  
  /**
   * Test-only current-user provider.
   *
   * The mutable identity lets integration tests simulate session changes
   * while keeping the same CareerDataService and repository instances.
   */
  class TestCurrentUserProvider
    implements CurrentUserProvider
  {
    constructor(
      private currentUser:
        CurrentUser | null
    ) {}
  
    setCurrentUser(
      currentUser:
        CurrentUser | null
    ): void {
      this.currentUser =
        currentUser;
    }
  
    async getCurrentUser():
      Promise<CurrentUser | null>
    {
      return this.currentUser
        ? {
            ...this.currentUser,
          }
        : null;
    }
  }
  
  function createQuestionnaireInput(
    overrides:
      Partial<QuestionnaireInput> = {}
  ): QuestionnaireInput {
    return {
      targetRole:
        "Security Analyst",
  
      experienceLevel:
        "beginner",
  
      existingSkills: [
        "Networking",
        "Linux",
      ],
  
      learningStyle:
        "hands-on",
  
      weeklyHours: 10,
  
      ...overrides,
    };
  }
  
  function createRoadmapInput(
    overrides:
      Partial<RoadmapInput> = {}
  ): RoadmapInput {
    return {
      title:
        "Security Analyst Roadmap",
  
      targetRole:
        "Security Analyst",
  
      estimatedWeeks: 8,
  
      milestones: [
        {
          id:
            "milestone-networking",
  
          order: 1,
  
          title:
            "Networking Fundamentals",
  
          description:
            "Review foundational networking concepts.",
  
          estimatedHours: 8,
  
          skills: [
            "TCP/IP",
            "DNS",
          ],
  
          status:
            "not-started",
        },
  
        {
          id:
            "milestone-linux",
  
          order: 2,
  
          title:
            "Linux Fundamentals",
  
          description:
            "Build practical Linux command-line skills.",
  
          estimatedHours: 10,
  
          skills: [
            "Linux",
            "Shell",
          ],
  
          status:
            "not-started",
        },
      ],
  
      ...overrides,
    };
  }
  
  describe(
    "CareerDataService",
    () => {
      let repository:
        InMemoryCareerRepository;
  
      let currentUserProvider:
        TestCurrentUserProvider;
  
      let service:
        CareerDataService;
  
      beforeEach(() => {
        repository =
          new InMemoryCareerRepository();
  
        currentUserProvider =
          new TestCurrentUserProvider({
            id: "user-a",
          });
  
        service =
          new CareerDataService(
            repository,
            currentUserProvider
          );
      });
  
      it(
        "saves questionnaire data for the current user",
        async () => {
          const saved =
            await service
              .saveMyQuestionnaire(
                createQuestionnaireInput()
              );
  
          expect(
            saved.userId
          ).toBe("user-a");
  
          expect(
            saved.targetRole
          ).toBe(
            "Security Analyst"
          );
  
          const persisted =
            await repository
              .getQuestionnaire(
                "user-a"
              );
  
          expect(
            persisted
          ).not.toBeNull();
  
          expect(
            persisted?.targetRole
          ).toBe(
            "Security Analyst"
          );
        }
      );
  
      it(
        "keeps questionnaire data isolated between users",
        async () => {
          await service
            .saveMyQuestionnaire(
              createQuestionnaireInput({
                targetRole:
                  "Security Analyst",
              })
            );
  
          currentUserProvider
            .setCurrentUser({
              id: "user-b",
            });
  
          expect(
            await service
              .getMyQuestionnaire()
          ).toBeNull();
  
          await service
            .saveMyQuestionnaire(
              createQuestionnaireInput({
                targetRole:
                  "Cloud Engineer",
              })
            );
  
          const userB =
            await service
              .getMyQuestionnaire();
  
          currentUserProvider
            .setCurrentUser({
              id: "user-a",
            });
  
          const userA =
            await service
              .getMyQuestionnaire();
  
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
        "creates and retrieves the current user's active roadmap",
        async () => {
          const created =
            await service
              .createOrReplaceMyRoadmap(
                createRoadmapInput()
              );
  
          expect(
            created.userId
          ).toBe("user-a");
  
          expect(
            created.title
          ).toBe(
            "Security Analyst Roadmap"
          );
  
          const retrieved =
            await service
              .getMyRoadmap();
  
          expect(
            retrieved
          ).toEqual(created);
        }
      );
  
      it(
        "keeps active roadmaps isolated between users",
        async () => {
          await service
            .createOrReplaceMyRoadmap(
              createRoadmapInput({
                title:
                  "User A Security Roadmap",
              })
            );
  
          currentUserProvider
            .setCurrentUser({
              id: "user-b",
            });
  
          expect(
            await service
              .getMyRoadmap()
          ).toBeNull();
  
          await service
            .createOrReplaceMyRoadmap(
              createRoadmapInput({
                title:
                  "User B Cloud Roadmap",
  
                targetRole:
                  "Cloud Engineer",
              })
            );
  
          const userB =
            await service
              .getMyRoadmap();
  
          currentUserProvider
            .setCurrentUser({
              id: "user-a",
            });
  
          const userA =
            await service
              .getMyRoadmap();
  
          expect(
            userA?.title
          ).toBe(
            "User A Security Roadmap"
          );
  
          expect(
            userB?.title
          ).toBe(
            "User B Cloud Roadmap"
          );
        }
      );
  
      it(
        "updates milestone status only on the current user's roadmap",
        async () => {
          await service
            .createOrReplaceMyRoadmap(
              createRoadmapInput({
                title:
                  "User A Roadmap",
              })
            );
  
          currentUserProvider
            .setCurrentUser({
              id: "user-b",
            });
  
          await service
            .createOrReplaceMyRoadmap(
              createRoadmapInput({
                title:
                  "User B Roadmap",
              })
            );
  
          /*
           * Both users intentionally have the same milestone ID.
           *
           * This proves that milestone identity by itself is not enough
           * to cross the user ownership boundary.
           */
          currentUserProvider
            .setCurrentUser({
              id: "user-a",
            });
  
          const updatedUserA =
            await service
              .updateMyMilestoneStatus(
                "milestone-linux",
                "in-progress"
              );
  
          const userAMilestone =
            updatedUserA
              .milestones
              .find(
                (milestone) =>
                  milestone.id ===
                  "milestone-linux"
              );
  
          expect(
            userAMilestone?.status
          ).toBe(
            "in-progress"
          );
  
          currentUserProvider
            .setCurrentUser({
              id: "user-b",
            });
  
          const userBRoadmap =
            await service
              .getMyRoadmap();
  
          const userBMilestone =
            userBRoadmap
              ?.milestones
              .find(
                (milestone) =>
                  milestone.id ===
                  "milestone-linux"
              );
  
          expect(
            userBMilestone?.status
          ).toBe(
            "not-started"
          );
        }
      );
  
      it(
        "resets only the current user's persisted data",
        async () => {
          await service
            .saveMyQuestionnaire(
              createQuestionnaireInput()
            );
  
          await service
            .createOrReplaceMyRoadmap(
              createRoadmapInput()
            );
  
          currentUserProvider
            .setCurrentUser({
              id: "user-b",
            });
  
          await service
            .saveMyQuestionnaire(
              createQuestionnaireInput({
                targetRole:
                  "Cloud Engineer",
              })
            );
  
          await service
            .createOrReplaceMyRoadmap(
              createRoadmapInput({
                title:
                  "User B Roadmap",
  
                targetRole:
                  "Cloud Engineer",
              })
            );
  
          currentUserProvider
            .setCurrentUser({
              id: "user-a",
            });
  
          await service
            .resetMyData();
  
          expect(
            await service
              .getMyQuestionnaire()
          ).toBeNull();
  
          expect(
            await service
              .getMyRoadmap()
          ).toBeNull();
  
          currentUserProvider
            .setCurrentUser({
              id: "user-b",
            });
  
          const userBQuestionnaire =
            await service
              .getMyQuestionnaire();
  
          const userBRoadmap =
            await service
              .getMyRoadmap();
  
          expect(
            userBQuestionnaire
              ?.targetRole
          ).toBe(
            "Cloud Engineer"
          );
  
          expect(
            userBRoadmap?.title
          ).toBe(
            "User B Roadmap"
          );
        }
      );
  
      it(
        "rejects questionnaire reads when there is no current user",
        async () => {
          currentUserProvider
            .setCurrentUser(null);
  
          await expect(
            service
              .getMyQuestionnaire()
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
        }
      );
  
      it(
        "rejects questionnaire writes when there is no current user",
        async () => {
          currentUserProvider
            .setCurrentUser(null);
  
          await expect(
            service
              .saveMyQuestionnaire(
                createQuestionnaireInput()
              )
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
        }
      );
  
      it(
        "rejects roadmap reads when there is no current user",
        async () => {
          currentUserProvider
            .setCurrentUser(null);
  
          await expect(
            service
              .getMyRoadmap()
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
        }
      );
  
      it(
        "rejects roadmap creation when there is no current user",
        async () => {
          currentUserProvider
            .setCurrentUser(null);
  
          await expect(
            service
              .createOrReplaceMyRoadmap(
                createRoadmapInput()
              )
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
        }
      );
  
      it(
        "rejects milestone updates when there is no current user",
        async () => {
          currentUserProvider
            .setCurrentUser(null);
  
          await expect(
            service
              .updateMyMilestoneStatus(
                "milestone-linux",
                "completed"
              )
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
        }
      );
  
      it(
        "rejects reset operations when there is no current user",
        async () => {
          currentUserProvider
            .setCurrentUser(null);
  
          await expect(
            service
              .resetMyData()
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
        }
      );
  
      it(
        "preserves repository errors after the user is authorized",
        async () => {
          await service
            .createOrReplaceMyRoadmap(
              createRoadmapInput()
            );
  
          await expect(
            service
              .updateMyMilestoneStatus(
                "missing-milestone",
                "completed"
              )
          ).rejects.toBeInstanceOf(
            PersistenceNotFoundError
          );
        }
      );
    }
  );