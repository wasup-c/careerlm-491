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
    ResumeInput,
  } from "../persistence/domain";
  
  import {
    InMemoryCareerRepository,
  } from "../persistence/in-memory-repository";
  
  import {
    CareerDataService,
  } from "./career-data-service";
  
  class TestCurrentUserProvider
    implements CurrentUserProvider
  {
    private currentUser:
      CurrentUser | null;
  
    constructor(
      userId: string | null
    ) {
      this.currentUser =
        userId === null
          ? null
          : {
              id: userId,
            };
    }
  
    setCurrentUser(
      userId: string | null
    ): void {
      this.currentUser =
        userId === null
          ? null
          : {
              id: userId,
            };
    }
  
    async getCurrentUser():
      Promise<CurrentUser | null>
    {
      return this.currentUser;
    }
  }
  
  const resume:
    ResumeInput = {
      normalizedText:
        "Synthetic resume deletion fixture.",
  
      sections: {
        education: [
          "B.S. Computer Science",
        ],
  
        experience: [
          "Software Engineering Internship",
        ],
  
        skills: [
          "TypeScript",
          "Git",
        ],
  
        projects: [
          "CareerLM",
        ],
      },
    };
  
  describe(
    "CareerDataService resume deletion",
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
          new TestCurrentUserProvider(
            "user-a"
          );
  
        service =
          new CareerDataService(
            repository,
            currentUserProvider
          );
      });
  
      it(
        "deletes only the current user's resume",
        async () => {
          currentUserProvider
            .setCurrentUser(
              "user-a"
            );
  
          await service
            .saveMyResume({
              ...resume,
  
              normalizedText:
                "User A resume",
            });
  
          currentUserProvider
            .setCurrentUser(
              "user-b"
            );
  
          await service
            .saveMyResume({
              ...resume,
  
              normalizedText:
                "User B resume",
            });
  
          currentUserProvider
            .setCurrentUser(
              "user-a"
            );
  
          await service
            .deleteMyResume();
  
          await expect(
            repository.getResume(
              "user-a"
            )
          ).resolves.toBeNull();
  
          expect(
            (
              await repository
                .getResume(
                  "user-b"
                )
            )?.normalizedText
          ).toBe(
            "User B resume"
          );
        }
      );
  
      it(
        "is safe when the current user has no resume",
        async () => {
          await expect(
            service.deleteMyResume()
          ).resolves.toBeUndefined();
  
          await expect(
            service.deleteMyResume()
          ).resolves.toBeUndefined();
        }
      );
  
      it(
        "resolves the active identity at deletion time",
        async () => {
          currentUserProvider
            .setCurrentUser(
              "user-a"
            );
  
          await service
            .saveMyResume({
              ...resume,
  
              normalizedText:
                "User A resume",
            });
  
          currentUserProvider
            .setCurrentUser(
              "user-b"
            );
  
          await service
            .saveMyResume({
              ...resume,
  
              normalizedText:
                "User B resume",
            });
  
          await service
            .deleteMyResume();
  
          expect(
            (
              await repository
                .getResume(
                  "user-a"
                )
            )?.normalizedText
          ).toBe(
            "User A resume"
          );
  
          await expect(
            repository.getResume(
              "user-b"
            )
          ).resolves.toBeNull();
        }
      );
  
      it(
        "rejects deletion when unauthenticated",
        async () => {
          await repository
            .saveResume(
              "user-a",
              resume
            );
  
          currentUserProvider
            .setCurrentUser(
              null
            );
  
          await expect(
            service.deleteMyResume()
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
  
          expect(
            await repository
              .getResume(
                "user-a"
              )
          ).not.toBeNull();
        }
      );
    }
  );