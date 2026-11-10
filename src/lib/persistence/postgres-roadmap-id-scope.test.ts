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
  
  import {
    PostgresCareerRepository,
  } from "./postgres-career-repository";
  
  const databaseUrl =
    process.env.DATABASE_URL?.trim();
  
  const describeDatabase =
    databaseUrl
      ? describe
      : describe.skip;
  
  describeDatabase(
    "PostgreSQL roadmap milestone ID scoping",
    () => {
      const pool =
        new Pool({
          connectionString:
            databaseUrl,
        });
  
      const repository =
        new PostgresCareerRepository(
          pool
        );
  
      const userA =
        "postgres-roadmap-scope-user-a";
  
      const userB =
        "postgres-roadmap-scope-user-b";
  
      async function cleanup() {
        await repository
          .resetDemoData(
            userA
          );
  
        await repository
          .resetDemoData(
            userB
          );
  
        await pool.query(
          `
            DELETE FROM users
            WHERE id = ANY(
              $1::text[]
            )
          `,
          [[userA, userB]]
        );
      }
  
      beforeEach(async () => {
        await cleanup();
      });
  
      afterAll(async () => {
        await cleanup();
  
        await pool.end();
      });
  
      it(
        "allows different users to persist the same generated milestone IDs",
        async () => {
          const roadmapInput = {
            title:
              "Software Engineer Career Roadmap",
            targetRole:
              "Software Engineer",
            estimatedWeeks: 16,
            milestones: [
              {
                id:
                  "foundation",
                order: 1,
                title:
                  "Build Software Engineer foundations",
                description:
                  "Build the required foundations.",
                estimatedHours:
                  10,
                skills: [
                  "Role Fundamentals",
                ],
                status:
                  "not-started" as const,
              },
              {
                id:
                  "core-skills",
                order: 2,
                title:
                  "Develop core Software Engineer skills",
                description:
                  "Develop the required core skills.",
                estimatedHours:
                  15,
                skills: [
                  "Industry Tools",
                ],
                status:
                  "not-started" as const,
              },
            ],
          };
  
          const roadmapA =
            await repository
              .createOrReplaceRoadmap(
                userA,
                roadmapInput
              );
  
          const roadmapB =
            await repository
              .createOrReplaceRoadmap(
                userB,
                roadmapInput
              );
  
          expect(
            roadmapA.id
          ).not.toBe(
            roadmapB.id
          );
  
          expect(
            roadmapA
              .milestones
              .map(
                (milestone) =>
                  milestone.id
              )
          ).toEqual([
            "foundation",
            "core-skills",
          ]);
  
          expect(
            roadmapB
              .milestones
              .map(
                (milestone) =>
                  milestone.id
              )
          ).toEqual([
            "foundation",
            "core-skills",
          ]);
  
          expect(
            await repository
              .getActiveRoadmap(
                userA
              )
          ).toMatchObject({
            userId: userA,
            milestones: [
              {
                id:
                  "foundation",
              },
              {
                id:
                  "core-skills",
              },
            ],
          });
  
          expect(
            await repository
              .getActiveRoadmap(
                userB
              )
          ).toMatchObject({
            userId: userB,
            milestones: [
              {
                id:
                  "foundation",
              },
              {
                id:
                  "core-skills",
              },
            ],
          });
        }
      );
    }
  );