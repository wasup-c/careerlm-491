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
    CareerRepository,
  } from "./repository";
  
  import type {
    ResumeInput,
  } from "./domain";
  
  import {
    InMemoryCareerRepository,
  } from "./in-memory-repository";
  
  import {
    JsonFileCareerRepository,
  } from "./json-file-repository";
  
  interface RepositoryHarness {
    repository:
      CareerRepository;
  
    cleanup:
      () => Promise<void>;
  }
  
  const resume:
    ResumeInput = {
      normalizedText:
        "Synthetic resume for deletion testing.",
  
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
                "careerlm-resume-delete-"
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
      `${implementation.name} resume deletion`,
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
          "deletes an existing resume",
          async () => {
            await repository
              .saveResume(
                "user-a",
                resume
              );
  
            await repository
              .deleteResume(
                "user-a"
              );
  
            await expect(
              repository.getResume(
                "user-a"
              )
            ).resolves.toBeNull();
          }
        );
  
        it(
          "is safe when the user has no resume",
          async () => {
            await expect(
              repository.deleteResume(
                "user-a"
              )
            ).resolves.toBeUndefined();
  
            await expect(
              repository.deleteResume(
                "user-a"
              )
            ).resolves.toBeUndefined();
          }
        );
  
        it(
          "preserves profile questionnaire and roadmap data",
          async () => {
            await repository
              .saveProfile(
                "user-a",
                {
                  name:
                    "Synthetic User",
  
                  targetRole:
                    "Security Analyst",
  
                  experienceLevel:
                    "beginner",
                }
              );
  
            await repository
              .saveQuestionnaire(
                "user-a",
                {
                  targetRole:
                    "Security Analyst",
  
                  experienceLevel:
                    "beginner",
  
                  existingSkills: [
                    "Linux",
                  ],
  
                  learningStyle:
                    "hands-on",
  
                  weeklyHours: 10,
                }
              );
  
            await repository
              .createOrReplaceRoadmap(
                "user-a",
                {
                  title:
                    "Security Analyst Roadmap",
  
                  targetRole:
                    "Security Analyst",
  
                  estimatedWeeks: 4,
  
                  milestones: [
                    {
                      id:
                        "milestone-1",
  
                      order: 1,
  
                      title:
                        "Security Fundamentals",
  
                      description:
                        "Practice security fundamentals.",
  
                      estimatedHours: 4,
  
                      skills: [
                        "Security",
                      ],
  
                      status:
                        "not-started",
                    },
                  ],
                }
              );
  
            await repository
              .saveResume(
                "user-a",
                resume
              );
  
            await repository
              .deleteResume(
                "user-a"
              );
  
            await expect(
              repository.getResume(
                "user-a"
              )
            ).resolves.toBeNull();
  
            expect(
              await repository.getProfile(
                "user-a"
              )
            ).not.toBeNull();
  
            expect(
              await repository
                .getQuestionnaire(
                  "user-a"
                )
            ).not.toBeNull();
  
            expect(
              await repository
                .getActiveRoadmap(
                  "user-a"
                )
            ).not.toBeNull();
          }
        );
  
        it(
          "does not delete another user's resume",
          async () => {
            await repository
              .saveResume(
                "user-a",
                {
                  ...resume,
  
                  normalizedText:
                    "User A resume",
                }
              );
  
            await repository
              .saveResume(
                "user-b",
                {
                  ...resume,
  
                  normalizedText:
                    "User B resume",
                }
              );
  
            await repository
              .deleteResume(
                "user-a"
              );
  
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
  }
  
  describe(
    "JsonFileCareerRepository resume deletion durability",
    () => {
      it(
        "keeps a deleted resume removed after repository recreation",
        async () => {
          const directory =
            await mkdtemp(
              path.join(
                tmpdir(),
                "careerlm-resume-delete-durability-"
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
              .saveResume(
                "persistent-user",
                resume
              );
  
            await firstRepository
              .deleteResume(
                "persistent-user"
              );
  
            const secondRepository =
              new JsonFileCareerRepository(
                filePath
              );
  
            await expect(
              secondRepository
                .getResume(
                  "persistent-user"
                )
            ).resolves.toBeNull();
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