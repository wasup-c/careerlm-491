import {
    Pool,
  } from "pg";
  
  import {
    afterAll,
    beforeEach,
    describe,
    expect,
    it,
  } from "vitest";
  
  import type {
    CurrentUserProvider,
  } from "../auth/current-user-provider";
  
  import {
    PersistenceNotFoundError,
  } from "../persistence/errors";
  
  import {
    PostgresCareerRepository,
  } from "../persistence/postgres-career-repository";
  
  import {
    CareerDataService,
  } from "../services/career-data-service";
  
  const databaseUrl =
    process.env.DATABASE_URL?.trim();
  
  const describeDatabase =
    databaseUrl
      ? describe
      : describe.skip;
  
  class StaticCurrentUserProvider
    implements CurrentUserProvider
  {
    constructor(
      private readonly userId:
        string
    ) {}
  
    async getCurrentUser() {
      return {
        id: this.userId,
      };
    }
  }
  
  describeDatabase(
    "CareerDataService with PostgreSQL",
    () => {
      const pool =
        new Pool({
          connectionString:
            databaseUrl,
        });
  
      const userA =
        "postgres-service-user-a";
  
      const userB =
        "postgres-service-user-b";
  
      function createService(
        userId: string
      ) {
        return new CareerDataService(
          new PostgresCareerRepository(
            pool
          ),
          new StaticCurrentUserProvider(
            userId
          )
        );
      }
  
      const cleanupRepository =
        new PostgresCareerRepository(
          pool
        );
  
      beforeEach(async () => {
        await cleanupRepository
          .resetDemoData(
            userA
          );
  
        await cleanupRepository
          .resetDemoData(
            userB
          );
      });
  
      afterAll(async () => {
        await cleanupRepository
          .resetDemoData(
            userA
          );
  
        await cleanupRepository
          .resetDemoData(
            userB
          );
  
        await pool.query(
          `
            DELETE FROM users
            WHERE id = ANY($1::text[])
          `,
          [[userA, userB]]
        );
  
        await pool.end();
      });
  
      it(
        "keeps current-user career data isolated in PostgreSQL",
        async () => {
          const serviceA =
            createService(
              userA
            );
  
          const serviceB =
            createService(
              userB
            );
  
          await serviceA
            .saveMyProfile({
              name:
                "Alex Rivera",
              targetRole:
                "Software Engineer",
              experienceLevel:
                "beginner",
            });
  
          await serviceA
            .saveMyQuestionnaire({
              targetRole:
                "Software Engineer",
              experienceLevel:
                "beginner",
              existingSkills: [
                "JavaScript",
              ],
              learningStyle:
                "hands-on",
              weeklyHours: 8,
            });
  
          await serviceA
            .createOrReplaceMyRoadmap({
              title:
                "Software Engineer Roadmap",
              targetRole:
                "Software Engineer",
              estimatedWeeks: 12,
              milestones: [
                {
                  id:
                    "postgres-service-milestone-a",
                  order: 1,
                  title:
                    "Programming Foundations",
                  description:
                    "Build programming fundamentals.",
                  estimatedHours:
                    10,
                  skills: [
                    "JavaScript",
                  ],
                  status:
                    "not-started",
                },
              ],
            });
  
          expect(
            await serviceA
              .getMyProfile()
          ).toMatchObject({
            userId: userA,
            name:
              "Alex Rivera",
            targetRole:
              "Software Engineer",
          });
  
          expect(
            await serviceB
              .getMyProfile()
          ).toBeNull();
  
          expect(
            await serviceB
              .getMyQuestionnaire()
          ).toBeNull();
  
          expect(
            await serviceB
              .getMyRoadmap()
          ).toBeNull();
  
          await expect(
            serviceB
              .updateMyMilestoneStatus(
                "postgres-service-milestone-a",
                "completed"
              )
          ).rejects.toBeInstanceOf(
            PersistenceNotFoundError
          );
  
          const updated =
            await serviceA
              .updateMyMilestoneStatus(
                "postgres-service-milestone-a",
                "completed"
              );
  
          expect(
            updated
              .milestones[0]
              .status
          ).toBe(
            "completed"
          );
        }
      );
  
      it(
        "reloads the same current-user state through a recreated service",
        async () => {
          const originalService =
            createService(
              userA
            );
  
          await originalService
            .saveMyProfile({
              targetRole:
                "Software Engineer",
              experienceLevel:
                "beginner",
            });
  
          await originalService
            .createOrReplaceMyRoadmap({
              title:
                "Persistent Roadmap",
              targetRole:
                "Software Engineer",
              estimatedWeeks: 8,
              milestones: [
                {
                  id:
                    "postgres-service-persistent-milestone",
                  order: 1,
                  title:
                    "Build a Project",
                  description:
                    "Complete a portfolio project.",
                  estimatedHours:
                    20,
                  skills: [
                    "React",
                  ],
                  status:
                    "completed",
                },
              ],
            });
  
          const recreatedService =
            createService(
              userA
            );
  
          expect(
            await recreatedService
              .getMyProfile()
          ).toMatchObject({
            userId: userA,
            targetRole:
              "Software Engineer",
            experienceLevel:
              "beginner",
          });
  
          expect(
            await recreatedService
              .getMyRoadmap()
          ).toMatchObject({
            userId: userA,
            title:
              "Persistent Roadmap",
            targetRole:
              "Software Engineer",
            estimatedWeeks: 8,
            milestones: [
              {
                id:
                  "postgres-service-persistent-milestone",
                order: 1,
                status:
                  "completed",
              },
            ],
          });
        }
      );
  
      it(
        "resets only the current user's career data",
        async () => {
          const serviceA =
            createService(
              userA
            );
  
          const serviceB =
            createService(
              userB
            );
  
          await serviceA
            .saveMyProfile({
              targetRole:
                "Software Engineer",
            });
  
          await serviceB
            .saveMyProfile({
              targetRole:
                "Data Analyst",
            });
  
          await serviceA
            .resetMyData();
  
          expect(
            await serviceA
              .getMyProfile()
          ).toBeNull();
  
          expect(
            await serviceB
              .getMyProfile()
          ).toMatchObject({
            userId: userB,
            targetRole:
              "Data Analyst",
          });
        }
      );
    }
  );