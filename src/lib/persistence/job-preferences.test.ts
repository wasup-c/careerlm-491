// @vitest-environment node

import {
    mkdtemp,
    readFile,
    rm,
    writeFile,
  } from "node:fs/promises";
  
  import {
    tmpdir,
  } from "node:os";
  
  import path from "node:path";
  
  import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
  } from "vitest";
  
  import type {
    JobPreferencesInput,
  } from "./domain";
  
  import {
    PersistenceCorruptionError,
    PersistenceValidationError,
  } from "./errors";
  
  import {
    InMemoryCareerRepository,
  } from "./in-memory-repository";
  
  import {
    JsonFileCareerRepository,
  } from "./json-file-repository";
  
  import {
    normalizeJobPreferences,
  } from "./job-preferences-validation";
  
  import type {
    CareerRepository,
  } from "./repository";
  
  function createPreferences(
    overrides:
      Partial<JobPreferencesInput> = {}
  ): JobPreferencesInput {
    return {
      keywords:
        "Software Engineer",
  
      location:
        "Los Angeles, CA",
  
      workplaceTypes: [
        "remote",
        "hybrid",
      ],
  
      employmentTypes: [
        "full-time",
      ],
  
      experienceLevels: [
        "entry",
        "mid",
      ],
  
      useResumeForMatching:
        true,
  
      usePortfolioForMatching:
        true,
  
      ...overrides,
    };
  }
  
  async function verifySharedRepositoryBehavior(
    repository:
      CareerRepository
  ): Promise<void> {
    const first =
      await repository
        .saveJobPreferences(
          "  user-a  ",
          createPreferences({
            keywords:
              "  Software Engineer  ",
  
            location:
              "  Los Angeles, CA  ",
  
            workplaceTypes: [
              "remote",
              "hybrid",
              "remote",
            ],
  
            employmentTypes: [
              "full-time",
              "full-time",
            ],
  
            experienceLevels: [
              "entry",
              "mid",
              "entry",
            ],
          })
        );
  
    expect(
      first.userId
    ).toBe(
      "user-a"
    );
  
    expect(
      first.keywords
    ).toBe(
      "Software Engineer"
    );
  
    expect(
      first.location
    ).toBe(
      "Los Angeles, CA"
    );
  
    expect(
      first.workplaceTypes
    ).toEqual([
      "remote",
      "hybrid",
    ]);
  
    expect(
      first.employmentTypes
    ).toEqual([
      "full-time",
    ]);
  
    expect(
      first.experienceLevels
    ).toEqual([
      "entry",
      "mid",
    ]);
  
    expect(
      first.schemaVersion
    ).toBe(1);
  
    expect(
      first.createdAt
    ).toBeTruthy();
  
    expect(
      first.updatedAt
    ).toBeTruthy();
  
    const loaded =
      await repository
        .getJobPreferences(
          "user-a"
        );
  
    expect(
      loaded
    ).toEqual(
      first
    );
  
    await repository
      .saveJobPreferences(
        "user-b",
        createPreferences({
          keywords:
            "Security Analyst",
  
          location:
            "Seattle, WA",
  
          workplaceTypes: [
            "remote",
          ],
  
          experienceLevels: [
            "entry",
          ],
  
          usePortfolioForMatching:
            false,
        })
      );
  
    const userA =
      await repository
        .getJobPreferences(
          "user-a"
        );
  
    const userB =
      await repository
        .getJobPreferences(
          "user-b"
        );
  
    expect(
      userA?.keywords
    ).toBe(
      "Software Engineer"
    );
  
    expect(
      userB?.keywords
    ).toBe(
      "Security Analyst"
    );
  
    const replacement =
      await repository
        .saveJobPreferences(
          "user-a",
          createPreferences({
            keywords:
              "Backend Engineer",
  
            workplaceTypes: [
              "remote",
            ],
  
            employmentTypes: [
              "full-time",
              "contract",
            ],
  
            experienceLevels: [
              "mid",
            ],
  
            usePortfolioForMatching:
              false,
          })
        );
  
    expect(
      replacement.createdAt
    ).toBe(
      first.createdAt
    );
  
    expect(
      replacement.keywords
    ).toBe(
      "Backend Engineer"
    );
  
    expect(
      replacement.employmentTypes
    ).toEqual([
      "full-time",
      "contract",
    ]);
  }
  
  describe(
    "normalizeJobPreferences",
    () => {
      it(
        "normalizes canonical preference input",
        () => {
          const result =
            normalizeJobPreferences(
              createPreferences({
                keywords:
                  "  Software Engineer  ",
  
                location:
                  "  Los Angeles, CA  ",
  
                workplaceTypes: [
                  "remote",
                  "remote",
                  "hybrid",
                ],
  
                employmentTypes: [
                  "full-time",
                  "full-time",
                ],
  
                experienceLevels: [
                  "entry",
                  "mid",
                  "entry",
                ],
              })
            );
  
          expect(
            result
          ).toEqual({
            keywords:
              "Software Engineer",
  
            location:
              "Los Angeles, CA",
  
            workplaceTypes: [
              "remote",
              "hybrid",
            ],
  
            employmentTypes: [
              "full-time",
            ],
  
            experienceLevels: [
              "entry",
              "mid",
            ],
  
            useResumeForMatching:
              true,
  
            usePortfolioForMatching:
              true,
          });
        }
      );
  
      it(
        "removes an empty optional location",
        () => {
          const result =
            normalizeJobPreferences(
              createPreferences({
                location:
                  "   ",
              })
            );
  
          expect(
            result.location
          ).toBeUndefined();
        }
      );
  
      it(
        "rejects blank keywords",
        () => {
          expect(() =>
            normalizeJobPreferences(
              createPreferences({
                keywords:
                  "   ",
              })
            )
          ).toThrow(
            PersistenceValidationError
          );
        }
      );
  
      it(
        "rejects unsupported preference values",
        () => {
          const invalid = {
            ...createPreferences(),
  
            workplaceTypes: [
              "teleport",
            ],
          } as unknown as
            JobPreferencesInput;
  
          expect(() =>
            normalizeJobPreferences(
              invalid
            )
          ).toThrow(
            PersistenceValidationError
          );
        }
      );
  
      it(
        "requires explicit matching-source booleans",
        () => {
          const invalid = {
            ...createPreferences(),
  
            useResumeForMatching:
              "yes",
          } as unknown as
            JobPreferencesInput;
  
          expect(() =>
            normalizeJobPreferences(
              invalid
            )
          ).toThrow(
            PersistenceValidationError
          );
        }
      );
    }
  );
  
  describe(
    "InMemoryCareerRepository job preferences",
    () => {
      it(
        "supports save, read, replace, normalization, and user isolation",
        async () => {
          const repository =
            new InMemoryCareerRepository();
  
          await verifySharedRepositoryBehavior(
            repository
          );
        }
      );
  
      it(
        "returns defensive copies",
        async () => {
          const repository =
            new InMemoryCareerRepository();
  
          const saved =
            await repository
              .saveJobPreferences(
                "user-a",
                createPreferences()
              );
  
          saved.keywords =
            "Modified Outside Repository";
  
          saved.workplaceTypes.push(
            "on-site"
          );
  
          const loaded =
            await repository
              .getJobPreferences(
                "user-a"
              );
  
          expect(
            loaded?.keywords
          ).toBe(
            "Software Engineer"
          );
  
          expect(
            loaded?.workplaceTypes
          ).toEqual([
            "remote",
            "hybrid",
          ]);
        }
      );
    }
  );
  
  describe(
    "JsonFileCareerRepository job preferences",
    () => {
      let temporaryDirectory:
        string;
  
      let dataFilePath:
        string;
  
      beforeEach(
        async () => {
          temporaryDirectory =
            await mkdtemp(
              path.join(
                tmpdir(),
                "careerlm-job-preferences-test-"
              )
            );
  
          dataFilePath =
            path.join(
              temporaryDirectory,
              "data.json"
            );
        }
      );
  
      afterEach(
        async () => {
          await rm(
            temporaryDirectory,
            {
              recursive:
                true,
  
              force:
                true,
            }
          );
        }
      );
  
      it(
        "supports the shared repository behavior",
        async () => {
          const repository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          await verifySharedRepositoryBehavior(
            repository
          );
        }
      );
  
      it(
        "persists preferences across repository recreation",
        async () => {
          const firstRepository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          await firstRepository
            .saveJobPreferences(
              "user-a",
              createPreferences({
                keywords:
                  "Security Engineer",
  
                location:
                  "San Diego, CA",
              })
            );
  
          const secondRepository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          const loaded =
            await secondRepository
              .getJobPreferences(
                "user-a"
              );
  
          expect(
            loaded?.keywords
          ).toBe(
            "Security Engineer"
          );
  
          expect(
            loaded?.location
          ).toBe(
            "San Diego, CA"
          );
  
          expect(
            loaded?.userId
          ).toBe(
            "user-a"
          );
        }
      );
  
      it(
        "writes job preferences under the owning user in JSON",
        async () => {
          const repository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          await repository
            .saveJobPreferences(
              "user-a",
              createPreferences()
            );
  
          const raw =
            JSON.parse(
              await readFile(
                dataFilePath,
                "utf8"
              )
            ) as {
              users:
                Record<
                  string,
                  {
                    jobPreferences?: {
                      keywords:
                        string;
                    };
                  }
                >;
            };
  
          expect(
            raw.users[
              "user-a"
            ].jobPreferences
              ?.keywords
          ).toBe(
            "Software Engineer"
          );
        }
      );
  
      it(
        "preserves unrelated persisted user state",
        async () => {
          const firstRepository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          await firstRepository
            .saveProfile(
              "user-a",
              {
                name:
                  "Synthetic User",
  
                targetRole:
                  "Software Engineer",
  
                experienceLevel:
                  "beginner",
              }
            );
  
          await firstRepository
            .saveJobPreferences(
              "user-a",
              createPreferences()
            );
  
          const secondRepository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          const profile =
            await secondRepository
              .getProfile(
                "user-a"
              );
  
          const preferences =
            await secondRepository
              .getJobPreferences(
                "user-a"
              );
  
          expect(
            profile?.name
          ).toBe(
            "Synthetic User"
          );
  
          expect(
            preferences?.keywords
          ).toBe(
            "Software Engineer"
          );
        }
      );
  
      it(
        "rejects corrupted persisted job-preference state",
        async () => {
          const timestamp =
            "2026-11-09T20:00:00.000Z";
  
          await writeFile(
            dataFilePath,
            JSON.stringify(
              {
                schemaVersion: 1,
  
                users: {
                  "user-a": {
                    jobPreferences: {
                      keywords:
                        "Software Engineer",
  
                      location:
                        "Los Angeles, CA",
  
                      workplaceTypes: [
                        "teleport",
                      ],
  
                      employmentTypes: [
                        "full-time",
                      ],
  
                      experienceLevels: [
                        "entry",
                      ],
  
                      useResumeForMatching:
                        true,
  
                      usePortfolioForMatching:
                        true,
  
                      userId:
                        "user-a",
  
                      schemaVersion:
                        1,
  
                      createdAt:
                        timestamp,
  
                      updatedAt:
                        timestamp,
                    },
                  },
                },
              },
              null,
              2
            ),
            "utf8"
          );
  
          const repository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          await expect(
            repository
              .getJobPreferences(
                "user-a"
              )
          ).rejects.toBeInstanceOf(
            PersistenceCorruptionError
          );
        }
      );
  
      it(
        "rejects persisted job preferences owned by another user",
        async () => {
          const timestamp =
            "2026-11-09T20:00:00.000Z";
  
          await writeFile(
            dataFilePath,
            JSON.stringify(
              {
                schemaVersion: 1,
  
                users: {
                  "user-a": {
                    jobPreferences: {
                      keywords:
                        "Software Engineer",
  
                      workplaceTypes: [
                        "remote",
                      ],
  
                      employmentTypes: [
                        "full-time",
                      ],
  
                      experienceLevels: [
                        "entry",
                      ],
  
                      useResumeForMatching:
                        true,
  
                      usePortfolioForMatching:
                        true,
  
                      userId:
                        "user-b",
  
                      schemaVersion:
                        1,
  
                      createdAt:
                        timestamp,
  
                      updatedAt:
                        timestamp,
                    },
                  },
                },
              },
              null,
              2
            ),
            "utf8"
          );
  
          const repository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          await expect(
            repository
              .getJobPreferences(
                "user-a"
              )
          ).rejects.toBeInstanceOf(
            PersistenceCorruptionError
          );
        }
      );
    }
  );