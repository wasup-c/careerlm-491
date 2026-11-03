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
        "Synthetic candidate with software engineering and security experience.",
  
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
          "Security Testing",
        ],
  
        projects: [
          "CareerLM",
        ],
      },
    };
  
  describe(
    "CareerDataService resume access",
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
        "returns null when the current user has no resume",
        async () => {
          await expect(
            service.getMyResume()
          ).resolves.toBeNull();
        }
      );
  
      it(
        "saves and retrieves the current user's resume",
        async () => {
          const saved =
            await service
              .saveMyResume(
                resume
              );
  
          expect(
            saved.userId
          ).toBe(
            "user-a"
          );
  
          const loaded =
            await service
              .getMyResume();
  
          expect(
            loaded
          ).toEqual(
            saved
          );
        }
      );
  
      it(
        "keeps resume operations scoped to the current user",
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
  
              sections: {
                ...resume.sections,
  
                skills: [
                  "Python",
                  "Cloud Security",
                ],
              },
            });
  
          currentUserProvider
            .setCurrentUser(
              "user-a"
            );
  
          const userA =
            await service
              .getMyResume();
  
          currentUserProvider
            .setCurrentUser(
              "user-b"
            );
  
          const userB =
            await service
              .getMyResume();
  
          expect(
            userA?.userId
          ).toBe(
            "user-a"
          );
  
          expect(
            userA?.normalizedText
          ).toBe(
            "User A resume"
          );
  
          expect(
            userA?.sections.skills
          ).toContain(
            "TypeScript"
          );
  
          expect(
            userB?.userId
          ).toBe(
            "user-b"
          );
  
          expect(
            userB?.normalizedText
          ).toBe(
            "User B resume"
          );
  
          expect(
            userB?.sections.skills
          ).toEqual([
            "Python",
            "Cloud Security",
          ]);
        }
      );
  
      it(
        "resolves the current user on every resume operation",
        async () => {
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
        "does not expose another user's resume after switching identities",
        async () => {
          currentUserProvider
            .setCurrentUser(
              "user-a"
            );
  
          await service
            .saveMyResume(
              resume
            );
  
          currentUserProvider
            .setCurrentUser(
              "user-b"
            );
  
          await expect(
            service.getMyResume()
          ).resolves.toBeNull();
        }
      );
  
      it(
        "rejects resume reads when unauthenticated",
        async () => {
          currentUserProvider
            .setCurrentUser(
              null
            );
  
          await expect(
            service.getMyResume()
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
        }
      );
  
      it(
        "rejects resume writes when unauthenticated",
        async () => {
          currentUserProvider
            .setCurrentUser(
              null
            );
  
          await expect(
            service.saveMyResume(
              resume
            )
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
  
          await expect(
            repository.getResume(
              "user-a"
            )
          ).resolves.toBeNull();
        }
      );
  
      it(
        "resetMyData removes only the current user's resume",
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
            .resetMyData();
  
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
    }
  );