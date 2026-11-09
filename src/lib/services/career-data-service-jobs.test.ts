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
    InMemoryCareerRepository,
  } from "../persistence/in-memory-repository";
  
  import {
    CareerDataService,
  } from "./career-data-service";
  
  import {
    JobSearchContextRequiredError,
  } from "./job-search-errors";
  
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
  
  function createJobPreferences(
    overrides:
      Partial<JobPreferencesInput> = {}
  ): JobPreferencesInput {
    return {
      keywords:
        "Backend Engineer",
  
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
        "Software engineer with TypeScript and React experience.",
  
      sections: {
        education: [
          "B.S. Computer Science",
        ],
  
        experience: [
          "Built REST APIs",
        ],
  
        skills: [
          "TypeScript",
          "React",
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
        "Software Engineer Roadmap",
  
      targetRole:
        "Software Engineer",
  
      estimatedWeeks: 8,
  
      milestones: [
        {
          id:
            "milestone-completed",
  
          order: 1,
  
          title:
            "Build Web Applications",
  
          description:
            "Practice production web development.",
  
          estimatedHours: 12,
  
          skills: [
            "Next.js",
            "TypeScript",
          ],
  
          status:
            "completed",
        },
  
        {
          id:
            "milestone-in-progress",
  
          order: 2,
  
          title:
            "Learn Deployment",
  
          description:
            "Practice deployment workflows.",
  
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
        "Backend Engineer",
  
      company:
        "Example Company",
  
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
        "2026-11-09T20:00:00.000Z",
    };
  }
  
  describe(
    "CareerDataService job search",
    () => {
      let repository:
        InMemoryCareerRepository;
  
      let currentUserProvider:
        TestCurrentUserProvider;
  
      let jobProvider:
        RecordingJobProvider;
  
      let service:
        CareerDataService;
  
      beforeEach(() => {
        repository =
          new InMemoryCareerRepository();
  
        currentUserProvider =
          new TestCurrentUserProvider({
            id:
              "user-a",
          });
  
        jobProvider =
          new RecordingJobProvider([
            createOpportunity(),
          ]);
  
        service =
          new CareerDataService(
            repository,
            currentUserProvider,
            jobProvider
          );
      });
  
      it(
        "saves and reads job preferences for the current user",
        async () => {
          const saved =
            await service
              .saveMyJobPreferences(
                createJobPreferences()
              );
  
          expect(
            saved.userId
          ).toBe(
            "user-a"
          );
  
          expect(
            saved.keywords
          ).toBe(
            "Backend Engineer"
          );
  
          const loaded =
            await service
              .getMyJobPreferences();
  
          expect(
            loaded
          ).toEqual(
            saved
          );
  
          expect(
            await repository
              .getJobPreferences(
                "user-b"
              )
          ).toBeNull();
        }
      );
  
      it(
        "keeps job preferences isolated when the current user changes",
        async () => {
          await service
            .saveMyJobPreferences(
              createJobPreferences({
                keywords:
                  "Backend Engineer",
              })
            );
  
          currentUserProvider
            .setCurrentUser({
              id:
                "user-b",
            });
  
          expect(
            await service
              .getMyJobPreferences()
          ).toBeNull();
  
          await service
            .saveMyJobPreferences(
              createJobPreferences({
                keywords:
                  "Security Analyst",
              })
            );
  
          const userB =
            await service
              .getMyJobPreferences();
  
          currentUserProvider
            .setCurrentUser({
              id:
                "user-a",
            });
  
          const userA =
            await service
              .getMyJobPreferences();
  
          expect(
            userA?.keywords
          ).toBe(
            "Backend Engineer"
          );
  
          expect(
            userB?.keywords
          ).toBe(
            "Security Analyst"
          );
        }
      );
  
      it(
        "aggregates preferences, profile, questionnaire, resume, and completed roadmap evidence",
        async () => {
          await service
            .saveMyJobPreferences(
              createJobPreferences()
            );
  
          await service
            .saveMyProfile({
              name:
                "Synthetic User",
  
              targetRole:
                "Software Engineer",
  
              experienceLevel:
                "intermediate",
            });
  
          await service
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
  
          await service
            .saveMyResume(
              createResumeInput()
            );
  
          await service
            .createOrReplaceMyRoadmap(
              createRoadmapInput()
            );
  
          const context =
            await service
              .getMyJobSearchContext();
  
          expect(
            context.targetRole
          ).toBe(
            "Software Engineer"
          );
  
          expect(
            context.keywords
          ).toBe(
            "Backend Engineer"
          );
  
          expect(
            context.location
          ).toBe(
            "Los Angeles, CA"
          );
  
          expect(
            context.workplaceTypes
          ).toEqual([
            "remote",
          ]);
  
          expect(
            context.employmentTypes
          ).toEqual([
            "full-time",
          ]);
  
          expect(
            context.experienceLevels
          ).toEqual([
            "mid",
          ]);
  
          expect(
            context.careerExperienceLevel
          ).toBe(
            "intermediate"
          );
  
          expect(
            context.questionnaireSkills
          ).toEqual([
            "Git",
            "REST",
          ]);
  
          expect(
            context.resumeSkills
          ).toEqual([
            "TypeScript",
            "React",
          ]);
  
          expect(
            context.resumeExperience
          ).toEqual([
            "Built REST APIs",
          ]);
  
          expect(
            context.portfolioSkills
          ).toEqual([
            "Next.js",
            "TypeScript",
          ]);
  
          expect(
            context.completedMilestoneIds
          ).toEqual([
            "milestone-completed",
          ]);
  
          expect(
            context.portfolioSkills
          ).not.toContain(
            "Docker"
          );
  
          expect(
            context.sources
          ).toEqual({
            preferences:
              true,
  
            profile:
              true,
  
            questionnaire:
              true,
  
            resume:
              true,
  
            portfolio:
              true,
          });
        }
      );
  
      it(
        "respects explicit resume and portfolio matching preferences",
        async () => {
          await service
            .saveMyJobPreferences(
              createJobPreferences({
                useResumeForMatching:
                  false,
  
                usePortfolioForMatching:
                  false,
              })
            );
  
          await service
            .saveMyResume(
              createResumeInput()
            );
  
          await service
            .createOrReplaceMyRoadmap(
              createRoadmapInput()
            );
  
          const context =
            await service
              .getMyJobSearchContext();
  
          expect(
            context.sources
              .resume
          ).toBe(true);
  
          expect(
            context.sources
              .portfolio
          ).toBe(true);
  
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
        "uses profile target role and maps career experience when preferences are missing",
        async () => {
          await service
            .saveMyProfile({
              targetRole:
                "Security Analyst",
  
              experienceLevel:
                "intermediate",
            });
  
          const context =
            await service
              .getMyJobSearchContext();
  
          expect(
            context.keywords
          ).toBe(
            "Security Analyst"
          );
  
          expect(
            context.targetRole
          ).toBe(
            "Security Analyst"
          );
  
          expect(
            context.experienceLevels
          ).toEqual([
            "mid",
          ]);
  
          expect(
            context.sources
              .preferences
          ).toBe(false);
        }
      );
  
      it(
        "can search using resume skills when no preferences or target role exist",
        async () => {
          await service
            .saveMyResume(
              createResumeInput({
                normalizedText:
                  "TypeScript React",
  
                sections: {
                  education: [],
  
                  experience: [],
  
                  skills: [
                    "TypeScript",
                    "React",
                  ],
  
                  projects: [],
                },
              })
            );
  
          const results =
            await service
              .searchJobsForMe({
                limit: 7,
              });
  
          expect(
            results
          ).toEqual([
            createOpportunity(),
          ]);
  
          expect(
            jobProvider
              .queries
          ).toHaveLength(
            1
          );
  
          expect(
            jobProvider
              .queries[0]
              .keywords
          ).toBe(
            "TypeScript React"
          );
  
          expect(
            jobProvider
              .queries[0]
              .limit
          ).toBe(7);
        }
      );
  
      it(
        "can search using completed portfolio skills when other search context is absent",
        async () => {
          await service
            .createOrReplaceMyRoadmap(
              createRoadmapInput({
                title:
                  "Cloud Roadmap",
  
                targetRole:
                  "Cloud Engineer",
  
                milestones: [
                  {
                    id:
                      "cloud-completed",
  
                    order: 1,
  
                    title:
                      "Cloud Infrastructure",
  
                    description:
                      "Build cloud infrastructure.",
  
                    estimatedHours:
                      12,
  
                    skills: [
                      "AWS",
                      "Terraform",
                    ],
  
                    status:
                      "completed",
                  },
                ],
              })
            );
  
          const context =
            await service
              .getMyJobSearchContext();
  
          expect(
            context.keywords
          ).toBe(
            "AWS Terraform"
          );
  
          await service
            .searchJobsForMe();
  
          expect(
            jobProvider
              .queries[0]
              .keywords
          ).toBe(
            "AWS Terraform"
          );
        }
      );
  
      it(
        "rejects a search when no useful current-user context exists",
        async () => {
          await expect(
            service
              .searchJobsForMe()
          ).rejects.toBeInstanceOf(
            JobSearchContextRequiredError
          );
  
          expect(
            jobProvider
              .queries
          ).toHaveLength(
            0
          );
        }
      );
  
      it(
        "uses only the newly active user's context after an identity change",
        async () => {
          await service
            .saveMyJobPreferences(
              createJobPreferences({
                keywords:
                  "Backend Engineer",
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
              })
            );
  
          await service
            .searchJobsForMe();
  
          expect(
            jobProvider
              .queries
          ).toHaveLength(
            1
          );
  
          expect(
            jobProvider
              .queries[0]
              .keywords
          ).toBe(
            "Security Analyst"
          );
  
          expect(
            jobProvider
              .queries[0]
              .location
          ).toBe(
            "Seattle, WA"
          );
        }
      );
  
      it(
        "requires authentication for current-user job operations",
        async () => {
          currentUserProvider
            .setCurrentUser(
              null
            );
  
          await expect(
            service
              .getMyJobPreferences()
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
  
          await expect(
            service
              .getMyJobSearchContext()
          ).rejects.toBeInstanceOf(
            AuthenticationRequiredError
          );
        }
      );
  
      it(
        "returns a controlled provider error when search is used without a configured provider",
        async () => {
          const serviceWithoutProvider =
            new CareerDataService(
              repository,
              currentUserProvider
            );
  
          await serviceWithoutProvider
            .saveMyProfile({
              targetRole:
                "Software Engineer",
            });
  
          await expect(
            serviceWithoutProvider
              .searchJobsForMe()
          ).rejects.toBeInstanceOf(
            JobProviderUnavailableError
          );
        }
      );
    }
  );