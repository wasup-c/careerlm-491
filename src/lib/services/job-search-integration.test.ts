// @vitest-environment node

import {
    mkdtemp,
    readFile,
    rm,
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
    CurrentUser,
    CurrentUserProvider,
  } from "../auth/current-user-provider";
  
  import {
    AuthenticationRequiredError,
  } from "../auth/errors";
  
  import type {
    JobOpportunity,
    JobSearchQuery,
  } from "../jobs/domain";
  
  import type {
    JobProvider,
  } from "../jobs/provider";
  
  import {
    JobProviderUnavailableError,
  } from "../jobs/provider-errors";
  
  import type {
    JobPreferencesInput,
    ResumeInput,
    RoadmapInput,
  } from "../persistence/domain";
  
  import {
    JsonFileCareerRepository,
  } from "../persistence/json-file-repository";
  
  import {
    CareerDataService,
  } from "./career-data-service";
  
  import {
    JobSearchContextRequiredError,
  } from "./job-search-errors";
  
  /**
   * Mutable current-user provider used only by this integration suite.
   *
   * This lets the same service and JSON repository simulate session changes
   * without allowing application callers to choose arbitrary persistence IDs.
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
  
  /**
   * Deterministic external-provider double.
   *
   * The rest of the integration path remains real. Only the external network
   * boundary is replaced so automated tests never depend on Jobicy.
   */
  class RecordingJobProvider
    implements JobProvider
  {
    readonly queries:
      JobSearchQuery[] = [];
  
    constructor(
      private readonly results:
        JobOpportunity[] = []
    ) {}
  
    async searchJobs(
      query: JobSearchQuery
    ): Promise<JobOpportunity[]> {
      this.queries.push(
        structuredClone(
          query
        )
      );
  
      return structuredClone(
        this.results
      );
    }
  }
  
  /**
   * Controlled provider failure used to verify that an external provider
   * outage cannot mutate or corrupt persisted CareerLM user state.
   */
  class FailingJobProvider
    implements JobProvider
  {
    async searchJobs():
      Promise<JobOpportunity[]>
    {
      throw new JobProviderUnavailableError();
    }
  }
  
  function createJobPreferences(
    overrides:
      Partial<JobPreferencesInput> = {}
  ): JobPreferencesInput {
    return {
      keywords:
        "Platform Engineer",
  
      location:
        "Los Angeles, CA",
  
      workplaceTypes: [
        "remote",
      ],
  
      employmentTypes: [
        "full-time",
      ],
  
      experienceLevels: [
        "mid",
      ],
  
      useResumeForMatching:
        true,
  
      usePortfolioForMatching:
        true,
  
      ...overrides,
    };
  }
  
  function createResumeInput(
    overrides:
      Partial<ResumeInput> = {}
  ): ResumeInput {
    return {
      normalizedText:
        "Platform engineer with TypeScript, Node.js, and API experience.",
  
      sections: {
        education: [
          "B.S. Computer Science",
        ],
  
        experience: [
          "Built production REST APIs",
          "Maintained backend services",
        ],
  
        skills: [
          "TypeScript",
          "Node.js",
        ],
  
        projects: [
          "CareerLM",
        ],
      },
  
      ...overrides,
    };
  }
  
  function createRoadmapInput(
    overrides:
      Partial<RoadmapInput> = {}
  ): RoadmapInput {
    return {
      title:
        "Platform Engineer Roadmap",
  
      targetRole:
        "Platform Engineer",
  
      estimatedWeeks: 8,
  
      milestones: [
        {
          id:
            "milestone-cloud",
  
          order: 1,
  
          title:
            "Cloud Infrastructure",
  
          description:
            "Build production cloud infrastructure.",
  
          estimatedHours: 12,
  
          skills: [
            "AWS",
            "Terraform",
          ],
  
          status:
            "completed",
        },
  
        {
          id:
            "milestone-containers",
  
          order: 2,
  
          title:
            "Container Operations",
  
          description:
            "Practice container workflows.",
  
          estimatedHours: 8,
  
          skills: [
            "Docker",
          ],
  
          status:
            "in-progress",
        },
      ],
  
      ...overrides,
    };
  }
  
  function createOpportunity():
    JobOpportunity
  {
    return {
      providerJobId:
        "job-123",
  
      title:
        "Platform Engineer",
  
      company:
        "Synthetic Company",
  
      location:
        "USA",
  
      workplaceType:
        "remote",
  
      employmentType:
        "full-time",
  
      experienceLevel:
        "mid",
  
      skills: [],
  
      applicationUrl:
        "https://example.com/jobs/123",
  
      source:
        "SyntheticProvider",
  
      retrievedAt:
        "2026-11-09T22:00:00.000Z",
    };
  }
  
  describe(
    "current-user job infrastructure integration",
    () => {
      let temporaryDirectory:
        string;
  
      let dataFilePath:
        string;
  
      let currentUserProvider:
        TestCurrentUserProvider;
  
      beforeEach(
        async () => {
          temporaryDirectory =
            await mkdtemp(
              path.join(
                tmpdir(),
                "careerlm-job-integration-"
              )
            );
  
          dataFilePath =
            path.join(
              temporaryDirectory,
              "data.json"
            );
  
          currentUserProvider =
            new TestCurrentUserProvider({
              id:
                "user-a",
            });
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
        "persists current-user career context across repository recreation and searches through JobProvider",
        async () => {
          const firstRepository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          const firstProvider =
            new RecordingJobProvider();
  
          const firstService =
            new CareerDataService(
              firstRepository,
              currentUserProvider,
              firstProvider
            );
  
          await firstService
            .saveMyProfile({
              name:
                "Synthetic User",
  
              targetRole:
                "Software Engineer",
  
              experienceLevel:
                "intermediate",
            });
  
          await firstService
            .saveMyQuestionnaire({
              targetRole:
                "Cloud Engineer",
  
              experienceLevel:
                "beginner",
  
              existingSkills: [
                "Git",
                "REST",
              ],
  
              learningStyle:
                "hands-on",
  
              weeklyHours: 10,
            });
  
          await firstService
            .saveMyResume(
              createResumeInput()
            );
  
          await firstService
            .createOrReplaceMyRoadmap(
              createRoadmapInput()
            );
  
          const savedPreferences =
            await firstService
              .saveMyJobPreferences(
                createJobPreferences()
              );
  
          expect(
            savedPreferences.userId
          ).toBe(
            "user-a"
          );
  
          /*
           * Recreate both the repository and service to prove that context is
           * coming from durable JSON state rather than in-memory objects.
           */
          const secondRepository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          const secondProvider =
            new RecordingJobProvider([
              createOpportunity(),
            ]);
  
          const secondService =
            new CareerDataService(
              secondRepository,
              currentUserProvider,
              secondProvider
            );
  
          const context =
            await secondService
              .getMyJobSearchContext();
  
          expect(
            context.keywords
          ).toBe(
            "Platform Engineer"
          );
  
          expect(
            context.targetRole
          ).toBe(
            "Software Engineer"
          );
  
          expect(
            context.location
          ).toBe(
            "Los Angeles, CA"
          );
  
          expect(
            context.resumeSkills
          ).toEqual([
            "TypeScript",
            "Node.js",
          ]);
  
          expect(
            context.resumeExperience
          ).toEqual([
            "Built production REST APIs",
            "Maintained backend services",
          ]);
  
          expect(
            context.questionnaireSkills
          ).toEqual([
            "Git",
            "REST",
          ]);
  
          expect(
            context.portfolioSkills
          ).toEqual([
            "AWS",
            "Terraform",
          ]);
  
          expect(
            context.completedMilestoneIds
          ).toEqual([
            "milestone-cloud",
          ]);
  
          /*
           * The incomplete Docker milestone must not become completed
           * portfolio evidence.
           */
          expect(
            context.portfolioSkills
          ).not.toContain(
            "Docker"
          );
  
          const results =
            await secondService
              .searchJobsForMe({
                limit: 3,
              });
  
          expect(
            results
          ).toEqual([
            createOpportunity(),
          ]);
  
          expect(
            secondProvider.queries
          ).toHaveLength(
            1
          );
  
          expect(
            secondProvider
              .queries[0]
          ).toEqual({
            keywords:
              "Platform Engineer",
  
            location:
              "Los Angeles, CA",
  
            workplaceTypes: [
              "remote",
            ],
  
            employmentTypes: [
              "full-time",
            ],
  
            experienceLevels: [
              "mid",
            ],
  
            limit: 3,
          });
  
          /*
           * External provider results are intentionally transient.
           *
           * They must not be written into CareerLM's persistence file by a
           * search operation.
           */
          const persistedAfterSearch =
            await readFile(
              dataFilePath,
              "utf8"
            );
  
          expect(
            persistedAfterSearch
          ).not.toContain(
            "job-123"
          );
  
          expect(
            persistedAfterSearch
          ).not.toContain(
            "SyntheticProvider"
          );
        }
      );
  
      it(
        "keeps User A and User B preferences isolated through JSON persistence and provider queries",
        async () => {
          const repository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          const provider =
            new RecordingJobProvider([
              createOpportunity(),
            ]);
  
          const service =
            new CareerDataService(
              repository,
              currentUserProvider,
              provider
            );
  
          await service
            .saveMyJobPreferences(
              createJobPreferences({
                keywords:
                  "Backend Engineer",
  
                location:
                  "Los Angeles, CA",
              })
            );
  
          currentUserProvider
            .setCurrentUser({
              id:
                "user-b",
            });
  
          await service
            .saveMyJobPreferences(
              createJobPreferences({
                keywords:
                  "Security Analyst",
  
                location:
                  "Seattle, WA",
  
                experienceLevels: [
                  "entry",
                ],
              })
            );
  
          /*
           * Recreate the repository so the isolation assertion is against
           * persisted state rather than the original repository instance.
           */
          const recreatedRepository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          const recreatedProvider =
            new RecordingJobProvider([
              createOpportunity(),
            ]);
  
          const recreatedService =
            new CareerDataService(
              recreatedRepository,
              currentUserProvider,
              recreatedProvider
            );
  
          await recreatedService
            .searchJobsForMe();
  
          expect(
            recreatedProvider
              .queries[0]
              .keywords
          ).toBe(
            "Security Analyst"
          );
  
          expect(
            recreatedProvider
              .queries[0]
              .location
          ).toBe(
            "Seattle, WA"
          );
  
          currentUserProvider
            .setCurrentUser({
              id:
                "user-a",
            });
  
          await recreatedService
            .searchJobsForMe();
  
          expect(
            recreatedProvider
              .queries[1]
              .keywords
          ).toBe(
            "Backend Engineer"
          );
  
          expect(
            recreatedProvider
              .queries[1]
              .location
          ).toBe(
            "Los Angeles, CA"
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
            "Backend Engineer"
          );
  
          expect(
            raw.users[
              "user-b"
            ].jobPreferences
              ?.keywords
          ).toBe(
            "Security Analyst"
          );
        }
      );
  
      it(
        "preserves persisted matching controls across repository recreation",
        async () => {
          const firstRepository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          const firstService =
            new CareerDataService(
              firstRepository,
              currentUserProvider,
              new RecordingJobProvider()
            );
  
          await firstService
            .saveMyJobPreferences(
              createJobPreferences({
                useResumeForMatching:
                  false,
  
                usePortfolioForMatching:
                  false,
              })
            );
  
          await firstService
            .saveMyResume(
              createResumeInput()
            );
  
          await firstService
            .createOrReplaceMyRoadmap(
              createRoadmapInput()
            );
  
          const recreatedRepository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          const recreatedService =
            new CareerDataService(
              recreatedRepository,
              currentUserProvider,
              new RecordingJobProvider()
            );
  
          const context =
            await recreatedService
              .getMyJobSearchContext();
  
          /*
           * The source records still exist.
           */
          expect(
            context.sources.resume
          ).toBe(true);
  
          expect(
            context.sources.portfolio
          ).toBe(true);
  
          /*
           * But the persisted matching preferences must prevent those sources
           * from entering the actual matching context.
           */
          expect(
            context.useResumeForMatching
          ).toBe(false);
  
          expect(
            context.usePortfolioForMatching
          ).toBe(false);
  
          expect(
            context.resumeSkills
          ).toEqual([]);
  
          expect(
            context.resumeExperience
          ).toEqual([]);
  
          expect(
            context.portfolioSkills
          ).toEqual([]);
  
          expect(
            context.completedMilestoneIds
          ).toEqual([]);
        }
      );
  
      it(
        "supports a resume-only search after JSON repository recreation",
        async () => {
          const firstRepository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          const firstService =
            new CareerDataService(
              firstRepository,
              currentUserProvider,
              new RecordingJobProvider()
            );
  
          await firstService
            .saveMyResume({
              normalizedText:
                "TypeScript Node.js",
  
              sections: {
                education: [],
  
                experience: [],
  
                skills: [
                  "TypeScript",
                  "Node.js",
                ],
  
                projects: [],
              },
            });
  
          const recreatedRepository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          const recreatedProvider =
            new RecordingJobProvider([
              createOpportunity(),
            ]);
  
          const recreatedService =
            new CareerDataService(
              recreatedRepository,
              currentUserProvider,
              recreatedProvider
            );
  
          await recreatedService
            .searchJobsForMe();
  
          expect(
            recreatedProvider.queries
          ).toHaveLength(
            1
          );
  
          expect(
            recreatedProvider
              .queries[0]
              .keywords
          ).toBe(
            "TypeScript Node.js"
          );
  
          expect(
            recreatedProvider
              .queries[0]
              .workplaceTypes
          ).toEqual([]);
  
          expect(
            recreatedProvider
              .queries[0]
              .employmentTypes
          ).toEqual([]);
        }
      );
  
      it(
        "does not modify persisted CareerLM state when the external provider fails",
        async () => {
          const repository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          const setupService =
            new CareerDataService(
              repository,
              currentUserProvider,
              new RecordingJobProvider()
            );
  
          await setupService
            .saveMyProfile({
              targetRole:
                "Platform Engineer",
  
              experienceLevel:
                "intermediate",
            });
  
          await setupService
            .saveMyJobPreferences(
              createJobPreferences()
            );
  
          const beforeFailure =
            await readFile(
              dataFilePath,
              "utf8"
            );
  
          const failingService =
            new CareerDataService(
              repository,
              currentUserProvider,
              new FailingJobProvider()
            );
  
          await expect(
            failingService
              .searchJobsForMe()
          ).rejects.toBeInstanceOf(
            JobProviderUnavailableError
          );
  
          const afterFailure =
            await readFile(
              dataFilePath,
              "utf8"
            );
  
          /*
           * Searching an external provider is read-only with respect to
           * CareerLM persistence.
           */
          expect(
            afterFailure
          ).toBe(
            beforeFailure
          );
  
          /*
           * Recreate the repository and verify the persisted user state is
           * still readable after the provider failure.
           */
          const recreatedRepository =
            new JsonFileCareerRepository(
              dataFilePath
            );
  
          const recoveryService =
            new CareerDataService(
              recreatedRepository,
              currentUserProvider,
              new RecordingJobProvider()
            );
  
          const preferences =
            await recoveryService
              .getMyJobPreferences();
  
          const profile =
            await recoveryService
              .getMyProfile();
  
          expect(
            preferences?.keywords
          ).toBe(
            "Platform Engineer"
          );
  
          expect(
            profile?.targetRole
          ).toBe(
            "Platform Engineer"
          );
        }
      );
  
      it(
        "rejects unauthenticated job operations before invoking the provider",
        async () => {
          currentUserProvider
            .setCurrentUser(
              null
            );
  
          const provider =
            new RecordingJobProvider([
              createOpportunity(),
            ]);
  
          const service =
            new CareerDataService(
              new JsonFileCareerRepository(
                dataFilePath
              ),
              currentUserProvider,
              provider
            );
  
          await expect(
            service
              .getMyJobSearchContext()
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
  
          await expect(
            service
              .searchJobsForMe()
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
  
          expect(
            provider.queries
          ).toHaveLength(
            0
          );
        }
      );
  
      it(
        "rejects a job search when the persisted user has no useful matching context",
        async () => {
          const provider =
            new RecordingJobProvider([
              createOpportunity(),
            ]);
  
          const service =
            new CareerDataService(
              new JsonFileCareerRepository(
                dataFilePath
              ),
              currentUserProvider,
              provider
            );
  
          await expect(
            service
              .searchJobsForMe()
          ).rejects.toBeInstanceOf(
            JobSearchContextRequiredError
          );
  
          expect(
            provider.queries
          ).toHaveLength(
            0
          );
        }
      );
    }
  );