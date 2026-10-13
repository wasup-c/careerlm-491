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
  
  import type {
    ProfileInput,
  } from "./domain";
  
  import {
    PersistenceValidationError,
  } from "./errors";
  
  import {
    InMemoryCareerRepository,
  } from "./in-memory-repository";
  
  import {
    JsonFileCareerRepository,
  } from "./json-file-repository";
  
  import type {
    CareerRepository,
  } from "./repository";
  
  interface RepositoryHarness {
    repository: CareerRepository;
  
    cleanup:
      () => Promise<void>;
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
  
  const implementations = [
    {
      name:
        "InMemoryCareerRepository",
  
      create:
        async (): Promise<RepositoryHarness> => ({
          repository:
            new InMemoryCareerRepository(),
  
          cleanup:
            async () => {},
        }),
    },
  
    {
      name:
        "JsonFileCareerRepository",
  
      create:
        async (): Promise<RepositoryHarness> => {
          const directory =
            await mkdtemp(
              path.join(
                tmpdir(),
                "careerlm-profile-contract-"
              )
            );
  
          const filePath =
            path.join(
              directory,
              "data.json"
            );
  
          return {
            repository:
              new JsonFileCareerRepository(
                filePath
              ),
  
            cleanup:
              async () => {
                await rm(
                  directory,
                  {
                    recursive: true,
                    force: true,
                  }
                );
              },
          };
        },
    },
  ];
  
  for (
    const implementation
    of implementations
  ) {
    describe(
      `${implementation.name} profile contract`,
      () => {
        let repository:
          CareerRepository;
  
        let cleanup:
          () => Promise<void>;
  
        beforeEach(async () => {
          const harness =
            await implementation.create();
  
          repository =
            harness.repository;
  
          cleanup =
            harness.cleanup;
        });
  
        afterEach(async () => {
          await cleanup();
        });
  
        it(
          "returns null when a user has no profile",
          async () => {
            await expect(
              repository.getProfile(
                "user-a"
              )
            ).resolves.toBeNull();
          }
        );
  
        it(
          "saves and retrieves a user-owned profile",
          async () => {
            const saved =
              await repository.saveProfile(
                "user-a",
                profile
              );
  
            expect(saved.userId)
              .toBe("user-a");
  
            expect(saved.schemaVersion)
              .toBe(1);
  
            expect(saved.name)
              .toBe("Christian Ramirez");
  
            await expect(
              repository.getProfile(
                "user-a"
              )
            ).resolves.toEqual(saved);
          }
        );
  
        it(
          "normalizes optional profile strings",
          async () => {
            const saved =
              await repository.saveProfile(
                "user-a",
                {
                  name:
                    "  Christian Ramirez  ",
  
                  targetRole:
                    "  Security Analyst  ",
  
                  experienceLevel:
                    "intermediate",
                }
              );
  
            expect(saved.name)
              .toBe("Christian Ramirez");
  
            expect(saved.targetRole)
              .toBe("Security Analyst");
          }
        );
  
        it(
          "keeps profiles isolated between users",
          async () => {
            await repository.saveProfile(
              "user-a",
              {
                ...profile,
                name: "User A",
              }
            );
  
            await repository.saveProfile(
              "user-b",
              {
                ...profile,
                name: "User B",
                targetRole:
                  "Software Engineer",
              }
            );
  
            const userA =
              await repository.getProfile(
                "user-a"
              );
  
            const userB =
              await repository.getProfile(
                "user-b"
              );
  
            expect(userA?.name)
              .toBe("User A");
  
            expect(userA?.targetRole)
              .toBe("Security Analyst");
  
            expect(userB?.name)
              .toBe("User B");
  
            expect(userB?.targetRole)
              .toBe("Software Engineer");
          }
        );
  
        it(
          "replaces editable fields while preserving createdAt",
          async () => {
            const first =
              await repository.saveProfile(
                "user-a",
                profile
              );
  
            const replacement =
              await repository.saveProfile(
                "user-a",
                {
                  name:
                    "Updated Name",
                }
              );
  
            expect(
              replacement.createdAt
            ).toBe(
              first.createdAt
            );
  
            expect(
              replacement.name
            ).toBe(
              "Updated Name"
            );
  
            expect(
              replacement.targetRole
            ).toBeUndefined();
  
            expect(
              replacement.experienceLevel
            ).toBeUndefined();
          }
        );
  
        it(
          "rejects unsupported experience levels",
          async () => {
            const invalidProfile = {
              ...profile,
              experienceLevel:
                "expert",
            } as unknown as ProfileInput;
  
            await expect(
              repository.saveProfile(
                "user-a",
                invalidProfile
              )
            ).rejects.toBeInstanceOf(
              PersistenceValidationError
            );
          }
        );
  
        it(
          "reset removes only the selected user's profile",
          async () => {
            await repository.saveProfile(
              "user-a",
              {
                ...profile,
                name: "User A",
              }
            );
  
            await repository.saveProfile(
              "user-b",
              {
                ...profile,
                name: "User B",
              }
            );
  
            await repository.resetDemoData(
              "user-a"
            );
  
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
            ).toBe("User B");
          }
        );
      }
    );
  }
  
  describe(
    "JsonFileCareerRepository profile durability",
    () => {
      it(
        "loads a profile through a new repository instance",
        async () => {
          const directory =
            await mkdtemp(
              path.join(
                tmpdir(),
                "careerlm-profile-durability-"
              )
            );
  
          const filePath =
            path.join(
              directory,
              "data.json"
            );
  
          try {
            const firstRepository =
              new JsonFileCareerRepository(
                filePath
              );
  
            await firstRepository
              .saveProfile(
                "persistent-user",
                profile
              );
  
            const secondRepository =
              new JsonFileCareerRepository(
                filePath
              );
  
            const persisted =
              await secondRepository
                .getProfile(
                  "persistent-user"
                );
  
            expect(persisted)
              .not.toBeNull();
  
            expect(persisted?.userId)
              .toBe("persistent-user");
  
            expect(persisted?.name)
              .toBe("Christian Ramirez");
  
            expect(persisted?.targetRole)
              .toBe("Security Analyst");
          } finally {
            await rm(
              directory,
              {
                recursive: true,
                force: true,
              }
            );
          }
        }
      );
    }
  );