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
    ProfileInput,
  } from "../persistence/domain";
  
  import {
    InMemoryCareerRepository,
  } from "../persistence/in-memory-repository";
  
  import {
    CareerDataService,
  } from "./career-data-service";
  
  class TestCurrentUserProvider
    implements CurrentUserProvider {
    private currentUser:
      CurrentUser | null;
  
    constructor(
      userId: string | null
    ) {
      this.currentUser =
        userId === null
          ? null
          : { id: userId };
    }
  
    setCurrentUser(
      userId: string | null
    ): void {
      this.currentUser =
        userId === null
          ? null
          : { id: userId };
    }
  
    async getCurrentUser():
      Promise<CurrentUser | null> {
      return this.currentUser;
    }
  }
  
  const profile:
    ProfileInput = {
      name:
        "Christian Ramirez",
  
      targetRole:
        "Security Analyst",
  
      experienceLevel:
        "beginner",
    };
  
  describe(
    "CareerDataService profile access",
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
        "saves and retrieves the current user's profile",
        async () => {
          const saved =
            await service
              .saveMyProfile(
                profile
              );
  
          expect(
            saved.userId
          ).toBe(
            "user-a"
          );
  
          const loaded =
            await service
              .getMyProfile();
  
          expect(
            loaded
          ).toEqual(saved);
        }
      );
  
      it(
        "keeps profile operations scoped to the current user",
        async () => {
          currentUserProvider
            .setCurrentUser(
              "user-a"
            );
  
          await service.saveMyProfile({
            ...profile,
            name: "User A",
            targetRole:
              "Security Analyst",
          });
  
          currentUserProvider
            .setCurrentUser(
              "user-b"
            );
  
          await service.saveMyProfile({
            ...profile,
            name: "User B",
            targetRole:
              "Software Engineer",
          });
  
          currentUserProvider
            .setCurrentUser(
              "user-a"
            );
  
          const userA =
            await service
              .getMyProfile();
  
          currentUserProvider
            .setCurrentUser(
              "user-b"
            );
  
          const userB =
            await service
              .getMyProfile();
  
          expect(
            userA?.userId
          ).toBe(
            "user-a"
          );
  
          expect(
            userA?.name
          ).toBe(
            "User A"
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
            userB?.name
          ).toBe(
            "User B"
          );
  
          expect(
            userB?.targetRole
          ).toBe(
            "Software Engineer"
          );
        }
      );
  
      it(
        "resolves the current user on every profile operation",
        async () => {
          await service.saveMyProfile({
            ...profile,
            name: "User A",
          });
  
          currentUserProvider
            .setCurrentUser(
              "user-b"
            );
  
          await service.saveMyProfile({
            ...profile,
            name: "User B",
          });
  
          expect(
            (
              await repository.getProfile(
                "user-a"
              )
            )?.name
          ).toBe(
            "User A"
          );
  
          expect(
            (
              await repository.getProfile(
                "user-b"
              )
            )?.name
          ).toBe(
            "User B"
          );
        }
      );
  
      it(
        "rejects profile reads when unauthenticated",
        async () => {
          currentUserProvider
            .setCurrentUser(null);
  
          await expect(
            service.getMyProfile()
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
        }
      );
  
      it(
        "rejects profile writes when unauthenticated",
        async () => {
          currentUserProvider
            .setCurrentUser(null);
  
          await expect(
            service.saveMyProfile(
              profile
            )
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
  
          await expect(
            repository.getProfile(
              "user-a"
            )
          ).resolves.toBeNull();
        }
      );
  
      it(
        "resetMyData removes only the current user's profile",
        async () => {
          currentUserProvider
            .setCurrentUser(
              "user-a"
            );
  
          await service.saveMyProfile({
            ...profile,
            name: "User A",
          });
  
          currentUserProvider
            .setCurrentUser(
              "user-b"
            );
  
          await service.saveMyProfile({
            ...profile,
            name: "User B",
          });
  
          currentUserProvider
            .setCurrentUser(
              "user-a"
            );
  
          await service.resetMyData();
  
          await expect(
            repository.getProfile(
              "user-a"
            )
          ).resolves.toBeNull();
  
          expect(
            (
              await repository.getProfile(
                "user-b"
              )
            )?.name
          ).toBe(
            "User B"
          );
        }
      );
    }
  );