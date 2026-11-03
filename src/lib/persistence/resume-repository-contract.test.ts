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
    ResumeInput,
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
    repository:
      CareerRepository;
  
    cleanup:
      () => Promise<void>;
  }
  
  const resume:
    ResumeInput = {
      normalizedText:
        "Synthetic candidate with software and security experience.",
  
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
                "careerlm-resume-contract-"
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
      `${implementation.name} resume contract`,
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
          "returns null when a user has no resume",
          async () => {
            await expect(
              repository.getResume(
                "user-a"
              )
            ).resolves.toBeNull();
          }
        );
  
        it(
          "saves and retrieves a user-owned resume",
          async () => {
            const saved =
              await repository.saveResume(
                "user-a",
                resume
              );
  
            expect(
              saved.userId
            ).toBe(
              "user-a"
            );
  
            expect(
              saved.schemaVersion
            ).toBe(1);
  
            expect(
              saved.normalizedText
            ).toBe(
              resume.normalizedText
            );
  
            await expect(
              repository.getResume(
                "user-a"
              )
            ).resolves.toEqual(
              saved
            );
          }
        );
  
        it(
          "normalizes resume text and section entries",
          async () => {
            const saved =
              await repository.saveResume(
                "  user-a  ",
                {
                  normalizedText:
                    "  Synthetic resume text  ",
  
                  sections: {
                    education: [
                      "  B.S. Computer Science  ",
                      "B.S. Computer Science",
                      "",
                    ],
  
                    experience: [
                      "  Software Internship  ",
                    ],
  
                    skills: [
                      " TypeScript ",
                      "TypeScript",
                      " Git ",
                    ],
  
                    projects: [],
                  },
                }
              );
  
            expect(
              saved.userId
            ).toBe(
              "user-a"
            );
  
            expect(
              saved.normalizedText
            ).toBe(
              "Synthetic resume text"
            );
  
            expect(
              saved.sections.education
            ).toEqual([
              "B.S. Computer Science",
            ]);
  
            expect(
              saved.sections.experience
            ).toEqual([
              "Software Internship",
            ]);
  
            expect(
              saved.sections.skills
            ).toEqual([
              "TypeScript",
              "Git",
            ]);
  
            expect(
              saved.sections.projects
            ).toEqual([]);
          }
        );
  
        it(
          "keeps resumes isolated between users",
          async () => {
            await repository.saveResume(
              "user-a",
              {
                ...resume,
                normalizedText:
                  "User A resume",
              }
            );
  
            await repository.saveResume(
              "user-b",
              {
                ...resume,
                normalizedText:
                  "User B resume",
              }
            );
  
            const userA =
              await repository.getResume(
                "user-a"
              );
  
            const userB =
              await repository.getResume(
                "user-b"
              );
  
            expect(
              userA?.normalizedText
            ).toBe(
              "User A resume"
            );
  
            expect(
              userB?.normalizedText
            ).toBe(
              "User B resume"
            );
          }
        );
  
        it(
          "replaces resume content while preserving createdAt",
          async () => {
            const first =
              await repository.saveResume(
                "user-a",
                resume
              );
  
            const replacement =
              await repository.saveResume(
                "user-a",
                {
                  normalizedText:
                    "Updated synthetic resume",
  
                  sections: {
                    education: [],
  
                    experience: [],
  
                    skills: [
                      "TypeScript",
                    ],
  
                    projects: [],
                  },
                }
              );
  
            expect(
              replacement.createdAt
            ).toBe(
              first.createdAt
            );
  
            expect(
              replacement.normalizedText
            ).toBe(
              "Updated synthetic resume"
            );
  
            expect(
              replacement.sections.skills
            ).toEqual([
              "TypeScript",
            ]);
          }
        );
  
        it(
          "rejects blank normalized resume text",
          async () => {
            await expect(
              repository.saveResume(
                "user-a",
                {
                  ...resume,
                  normalizedText:
                    "   ",
                }
              )
            ).rejects.toBeInstanceOf(
              PersistenceValidationError
            );
          }
        );
  
        it(
          "reset removes only the selected user's resume",
          async () => {
            await repository.saveResume(
              "user-a",
              {
                ...resume,
                normalizedText:
                  "User A resume",
              }
            );
  
            await repository.saveResume(
              "user-b",
              {
                ...resume,
                normalizedText:
                  "User B resume",
              }
            );
  
            await repository.resetDemoData(
              "user-a"
            );
  
            await expect(
              repository.getResume(
                "user-a"
              )
            ).resolves.toBeNull();
  
            expect(
              (
                await repository.getResume(
                  "user-b"
                )
              )?.normalizedText
            ).toBe(
              "User B resume"
            );
          }
        );
  
        it(
          "returns defensive copies of resume state",
          async () => {
            await repository.saveResume(
              "user-a",
              resume
            );
  
            const firstRead =
              await repository.getResume(
                "user-a"
              );
  
            expect(
              firstRead
            ).not.toBeNull();
  
            if (!firstRead) {
              throw new Error(
                "Expected resume."
              );
            }
  
            firstRead.normalizedText =
              "Modified Outside Repository";
  
            firstRead.sections.skills.push(
              "Injected Skill"
            );
  
            const secondRead =
              await repository.getResume(
                "user-a"
              );
  
            expect(
              secondRead?.normalizedText
            ).toBe(
              resume.normalizedText
            );
  
            expect(
              secondRead?.sections.skills
            ).not.toContain(
              "Injected Skill"
            );
          }
        );
      }
    );
  }
  
  describe(
    "JsonFileCareerRepository resume durability",
    () => {
      it(
        "loads a resume through a new repository instance",
        async () => {
          const directory =
            await mkdtemp(
              path.join(
                tmpdir(),
                "careerlm-resume-durability-"
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
  
            const secondRepository =
              new JsonFileCareerRepository(
                filePath
              );
  
            const persisted =
              await secondRepository
                .getResume(
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
              persisted?.normalizedText
            ).toBe(
              resume.normalizedText
            );
  
            expect(
              persisted?.sections.skills
            ).toContain(
              "TypeScript"
            );
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