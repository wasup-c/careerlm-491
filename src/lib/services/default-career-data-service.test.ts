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
  } from "node:fs/promises";
  
  import {
    tmpdir,
  } from "node:os";
  
  import path from "node:path";
  
  import {
    DemoCurrentUserProvider,
  } from "../auth/demo-current-user-provider";
  
  import {
    InMemoryCareerRepository,
  } from "../persistence/in-memory-repository";
  
  import {
    JsonFileCareerRepository,
  } from "../persistence/json-file-repository";
  
  import type {
    QuestionnaireInput,
  } from "../persistence/domain";
  
  import {
    createDefaultCareerDataService,
  } from "./default-career-data-service";
  
  const questionnaire:
    QuestionnaireInput = {
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
    };
  
  describe(
    "default CareerDataService composition",
    () => {
      let directory: string;
  
      beforeEach(async () => {
        directory =
          await mkdtemp(
            path.join(
              tmpdir(),
              "careerlm-service-composition-"
            )
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
        "uses the demo current user when no provider override is supplied",
        async () => {
          const repository =
            new InMemoryCareerRepository();
  
          const service =
            createDefaultCareerDataService({
              repository,
            });
  
          await service
            .saveMyQuestionnaire(
              questionnaire
            );
  
          const persisted =
            await repository
              .getQuestionnaire(
                "demo-user"
              );
  
          expect(
            persisted
          ).not.toBeNull();
  
          expect(
            persisted?.userId
          ).toBe(
            "demo-user"
          );
  
          expect(
            persisted?.targetRole
          ).toBe(
            "Security Analyst"
          );
        }
      );
  
      it(
        "uses an explicitly supplied current-user provider",
        async () => {
          const repository =
            new InMemoryCareerRepository();
  
          const currentUserProvider =
            new DemoCurrentUserProvider(
              "user-a"
            );
  
          const service =
            createDefaultCareerDataService({
              repository,
              currentUserProvider,
            });
  
          await service
            .saveMyQuestionnaire(
              questionnaire
            );
  
          const userA =
            await repository
              .getQuestionnaire(
                "user-a"
              );
  
          const demoUser =
            await repository
              .getQuestionnaire(
                "demo-user"
              );
  
          expect(
            userA
          ).not.toBeNull();
  
          expect(
            userA?.userId
          ).toBe(
            "user-a"
          );
  
          expect(
            demoUser
          ).toBeNull();
        }
      );
  
      it(
        "keeps two composed services isolated when they share the same repository",
        async () => {
          const repository =
            new InMemoryCareerRepository();
  
          const userAService =
            createDefaultCareerDataService({
              repository,
  
              currentUserProvider:
                new DemoCurrentUserProvider(
                  "user-a"
                ),
            });
  
          const userBService =
            createDefaultCareerDataService({
              repository,
  
              currentUserProvider:
                new DemoCurrentUserProvider(
                  "user-b"
                ),
            });
  
          await userAService
            .saveMyQuestionnaire({
              ...questionnaire,
  
              targetRole:
                "Security Analyst",
            });
  
          await userBService
            .saveMyQuestionnaire({
              ...questionnaire,
  
              targetRole:
                "Software Engineer",
            });
  
          const userA =
            await userAService
              .getMyQuestionnaire();
  
          const userB =
            await userBService
              .getMyQuestionnaire();
  
          expect(
            userA?.userId
          ).toBe(
            "user-a"
          );
  
          expect(
            userA?.targetRole
          ).toBe(
            "Security Analyst"
          );
  
          expect(
            userB?.userId
          ).toBe(
            "user-b"
          );
  
          expect(
            userB?.targetRole
          ).toBe(
            "Software Engineer"
          );
        }
      );
  
      it(
        "works across the current-user, service, and JSON persistence layers",
        async () => {
          const filePath =
            path.join(
              directory,
              "data.json"
            );
  
          const repository =
            new JsonFileCareerRepository(
              filePath
            );
  
          const service =
            createDefaultCareerDataService({
              repository,
  
              currentUserProvider:
                new DemoCurrentUserProvider(
                  "persistent-user"
                ),
            });
  
          await service
            .saveMyQuestionnaire(
              questionnaire
            );
  
          const reloadedRepository =
            new JsonFileCareerRepository(
              filePath
            );
  
          const persisted =
            await reloadedRepository
              .getQuestionnaire(
                "persistent-user"
              );
  
          expect(
            persisted
          ).not.toBeNull();
  
          expect(
            persisted?.userId
          ).toBe(
            "persistent-user"
          );
  
          expect(
            persisted?.targetRole
          ).toBe(
            "Security Analyst"
          );
  
          expect(
            persisted?.existingSkills
          ).toEqual([
            "Linux",
            "Networking",
          ]);
        }
      );
    }
  );