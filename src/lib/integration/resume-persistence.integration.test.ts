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
    CurrentUser,
    CurrentUserProvider,
  } from "../auth/current-user-provider";
  
  import type {
    ResumeInput,
  } from "../persistence/domain";
  
  import {
    JsonFileCareerRepository,
  } from "../persistence/json-file-repository";
  
  import {
    CareerDataService,
  } from "../services/career-data-service";
  
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
  
  /**
   * Synthetic normalized output representing the contract expected from
   * Member 3's résumé extraction/normalization layer.
   *
   * This test deliberately begins after parsing. Member 1 owns persistence
   * and current-user data access, not résumé extraction.
   */
  const normalizedResumeFromParser:
    ResumeInput = {
      normalizedText:
        "Synthetic software engineering candidate with TypeScript, React, and Git experience.",
  
      sections: {
        education: [
          "B.S. Computer Science",
        ],
  
        experience: [
          "Software Engineering Intern",
        ],
  
        skills: [
          "TypeScript",
          "React",
          "Git",
        ],
  
        projects: [
          "CareerLM",
        ],
      },
    };
  
  describe(
    "resume persistence lifecycle integration",
    () => {
      let directory:
        string;
  
      let filePath:
        string;
  
      beforeEach(async () => {
        directory =
          await mkdtemp(
            path.join(
              tmpdir(),
              "careerlm-resume-integration-"
            )
          );
  
        filePath =
          path.join(
            directory,
            "data.json"
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
        "persists synthetic normalized parser output across repository recreation",
        async () => {
          const firstProvider =
            new TestCurrentUserProvider(
              "user-a"
            );
  
          const firstService =
            new CareerDataService(
              new JsonFileCareerRepository(
                filePath
              ),
              firstProvider
            );
  
          const saved =
            await firstService
              .saveMyResume(
                normalizedResumeFromParser
              );
  
          expect(
            saved.userId
          ).toBe(
            "user-a"
          );
  
          const secondProvider =
            new TestCurrentUserProvider(
              "user-a"
            );
  
          const secondService =
            new CareerDataService(
              new JsonFileCareerRepository(
                filePath
              ),
              secondProvider
            );
  
          const loaded =
            await secondService
              .getMyResume();
  
          expect(
            loaded
          ).not.toBeNull();
  
          expect(
            loaded?.normalizedText
          ).toBe(
            normalizedResumeFromParser
              .normalizedText
          );
  
          expect(
            loaded?.sections.skills
          ).toEqual([
            "TypeScript",
            "React",
            "Git",
          ]);
        }
      );
  
      it(
        "prevents another current user from reading the persisted resume",
        async () => {
          const provider =
            new TestCurrentUserProvider(
              "user-a"
            );
  
          const service =
            new CareerDataService(
              new JsonFileCareerRepository(
                filePath
              ),
              provider
            );
  
          await service
            .saveMyResume(
              normalizedResumeFromParser
            );
  
          provider
            .setCurrentUser(
              "user-b"
            );
  
          await expect(
            service.getMyResume()
          ).resolves.toBeNull();
  
          provider
            .setCurrentUser(
              "user-a"
            );
  
          expect(
            await service
              .getMyResume()
          ).not.toBeNull();
        }
      );
  
      it(
        "replaces the current resume while preserving createdAt",
        async () => {
          const provider =
            new TestCurrentUserProvider(
              "user-a"
            );
  
          const service =
            new CareerDataService(
              new JsonFileCareerRepository(
                filePath
              ),
              provider
            );
  
          const first =
            await service
              .saveMyResume(
                normalizedResumeFromParser
              );
  
          const replacement =
            await service
              .saveMyResume({
                normalizedText:
                  "Updated synthetic resume with cloud security experience.",
  
                sections: {
                  education: [
                    "B.S. Computer Science",
                  ],
  
                  experience: [
                    "Cloud Security Intern",
                  ],
  
                  skills: [
                    "TypeScript",
                    "AWS",
                    "Security Testing",
                  ],
  
                  projects: [
                    "CareerLM",
                  ],
                },
              });
  
          expect(
            replacement.createdAt
          ).toBe(
            first.createdAt
          );
  
          expect(
            replacement.normalizedText
          ).toBe(
            "Updated synthetic resume with cloud security experience."
          );
  
          const reloadedService =
            new CareerDataService(
              new JsonFileCareerRepository(
                filePath
              ),
              new TestCurrentUserProvider(
                "user-a"
              )
            );
  
          const reloaded =
            await reloadedService
              .getMyResume();
  
          expect(
            reloaded?.sections.skills
          ).toEqual([
            "TypeScript",
            "AWS",
            "Security Testing",
          ]);
        }
      );
  
      it(
        "deletes only the resume while preserving other persisted user data",
        async () => {
          const provider =
            new TestCurrentUserProvider(
              "user-a"
            );
  
          const service =
            new CareerDataService(
              new JsonFileCareerRepository(
                filePath
              ),
              provider
            );
  
          await service
            .saveMyProfile({
              name:
                "Synthetic User",
  
              targetRole:
                "Security Analyst",
  
              experienceLevel:
                "beginner",
            });
  
          await service
            .saveMyQuestionnaire({
              targetRole:
                "Security Analyst",
  
              experienceLevel:
                "beginner",
  
              existingSkills: [
                "Linux",
                "Git",
              ],
  
              learningStyle:
                "hands-on",
  
              weeklyHours: 10,
            });
  
          await service
            .createOrReplaceMyRoadmap({
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
            });
  
          await service
            .saveMyResume(
              normalizedResumeFromParser
            );
  
          await service
            .deleteMyResume();
  
          const reloadedService =
            new CareerDataService(
              new JsonFileCareerRepository(
                filePath
              ),
              new TestCurrentUserProvider(
                "user-a"
              )
            );
  
          await expect(
            reloadedService
              .getMyResume()
          ).resolves.toBeNull();
  
          expect(
            await reloadedService
              .getMyProfile()
          ).not.toBeNull();
  
          expect(
            await reloadedService
              .getMyQuestionnaire()
          ).not.toBeNull();
  
          expect(
            await reloadedService
              .getMyRoadmap()
          ).not.toBeNull();
        }
      );
    }
  );