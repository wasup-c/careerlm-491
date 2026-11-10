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
    PersistenceNotFoundError,
  } from "./errors";
  
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
    "PostgresCareerRepository",
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
        "postgres-test-user-a";
  
      const userB =
        "postgres-test-user-b";
  
      beforeEach(async () => {
        await repository.resetDemoData(
          userA
        );
  
        await repository.resetDemoData(
          userB
        );
      });
  
      afterAll(async () => {
        await repository.resetDemoData(
          userA
        );
  
        await repository.resetDemoData(
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
        "persists profile, questionnaire, resume, and job preferences by user",
        async () => {
          await repository.saveProfile(
            userA,
            {
              name: "Alex Rivera",
              targetRole:
                "Software Engineer",
              experienceLevel:
                "beginner",
            }
          );
  
          await repository.saveQuestionnaire(
            userA,
            {
              targetRole:
                "Software Engineer",
              experienceLevel:
                "beginner",
              existingSkills: [
                "JavaScript",
                "Git",
              ],
              learningStyle:
                "hands-on",
              weeklyHours: 8,
              additionalResponses: {
                timeline:
                  "3-6 months",
              },
            }
          );
  
          await repository.saveResume(
            userA,
            {
              normalizedText:
                "Software engineering resume",
              sections: {
                education: [
                  "Example University",
                ],
                experience: [],
                skills: [
                  "JavaScript",
                  "Git",
                ],
                projects: [
                  "CareerLM",
                ],
              },
            }
          );
  
          await repository.saveJobPreferences(
            userA,
            {
              keywords:
                "Software Engineer",
              location:
                "California",
              workplaceTypes: [
                "remote",
                "hybrid",
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
            }
          );
  
          expect(
            await repository.getProfile(
              userA
            )
          ).toMatchObject({
            userId: userA,
            name: "Alex Rivera",
            targetRole:
              "Software Engineer",
            experienceLevel:
              "beginner",
            schemaVersion: 1,
          });
  
          expect(
            await repository.getQuestionnaire(
              userA
            )
          ).toMatchObject({
            userId: userA,
            targetRole:
              "Software Engineer",
            experienceLevel:
              "beginner",
            existingSkills: [
              "JavaScript",
              "Git",
            ],
            learningStyle:
              "hands-on",
            weeklyHours: 8,
            additionalResponses: {
              timeline:
                "3-6 months",
            },
            schemaVersion: 1,
          });
  
          expect(
            await repository.getResume(
              userA
            )
          ).toMatchObject({
            userId: userA,
            normalizedText:
              "Software engineering resume",
            sections: {
              education: [
                "Example University",
              ],
              experience: [],
              skills: [
                "JavaScript",
                "Git",
              ],
              projects: [
                "CareerLM",
              ],
            },
            schemaVersion: 1,
          });
  
          expect(
            await repository.getJobPreferences(
              userA
            )
          ).toMatchObject({
            userId: userA,
            keywords:
              "Software Engineer",
            location:
              "California",
            workplaceTypes: [
              "remote",
              "hybrid",
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
            schemaVersion: 1,
          });
  
          expect(
            await repository.getProfile(
              userB
            )
          ).toBeNull();
  
          expect(
            await repository.getResume(
              userB
            )
          ).toBeNull();
  
          expect(
            await repository.getJobPreferences(
              userB
            )
          ).toBeNull();
        }
      );
  
      it(
        "persists roadmap milestones and updates progress without crossing users",
        async () => {
          const roadmap =
            await repository.createOrReplaceRoadmap(
              userA,
              {
                title:
                  "Software Engineer Roadmap",
                targetRole:
                  "Software Engineer",
                estimatedWeeks: 12,
                milestones: [
                  {
                    id:
                      "postgres-milestone-1",
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
                  {
                    id:
                      "postgres-milestone-2",
                    order: 2,
                    title:
                      "Build a Project",
                    description:
                      "Apply skills in a project.",
                    estimatedHours:
                      20,
                    skills: [
                      "React",
                    ],
                    status:
                      "not-started",
                  },
                ],
              }
            );
  
          expect(
            roadmap.userId
          ).toBe(userA);
  
          expect(
            roadmap.milestones
          ).toHaveLength(2);
  
          const recreatedRepository =
            new PostgresCareerRepository(
              pool
            );
  
          const reloaded =
            await recreatedRepository.getActiveRoadmap(
              userA
            );
  
          expect(
            reloaded
          ).toMatchObject({
            userId: userA,
            title:
              "Software Engineer Roadmap",
            targetRole:
              "Software Engineer",
            estimatedWeeks: 12,
          });
  
          expect(
            reloaded?.milestones.map(
              (milestone) => ({
                id: milestone.id,
                order:
                  milestone.order,
                status:
                  milestone.status,
              })
            )
          ).toEqual([
            {
              id:
                "postgres-milestone-1",
              order: 1,
              status:
                "not-started",
            },
            {
              id:
                "postgres-milestone-2",
              order: 2,
              status:
                "not-started",
            },
          ]);
  
          const updated =
            await recreatedRepository.updateMilestoneStatus(
              userA,
              "postgres-milestone-1",
              "completed"
            );
  
          expect(
            updated.milestones[0]
              .status
          ).toBe(
            "completed"
          );
  
          const persisted =
            await repository.getActiveRoadmap(
              userA
            );
  
          expect(
            persisted?.milestones[0]
              .status
          ).toBe(
            "completed"
          );
  
          expect(
            await repository.getActiveRoadmap(
              userB
            )
          ).toBeNull();
  
          await expect(
            repository.updateMilestoneStatus(
              userB,
              "postgres-milestone-1",
              "completed"
            )
          ).rejects.toBeInstanceOf(
            PersistenceNotFoundError
          );
        }
      );
  
      it(
        "deletes only the current resume when requested",
        async () => {
          const resume = {
            normalizedText:
              "Test resume",
            sections: {
              education: [],
              experience: [],
              skills: [
                "TypeScript",
              ],
              projects: [],
            },
          };
  
          await repository.saveResume(
            userA,
            resume
          );
  
          await repository.saveResume(
            userB,
            resume
          );
  
          await repository.deleteResume(
            userA
          );
  
          expect(
            await repository.getResume(
              userA
            )
          ).toBeNull();
  
          expect(
            await repository.getResume(
              userB
            )
          ).not.toBeNull();
        }
      );
  
      it(
        "resets career data for one user without affecting another user",
        async () => {
          await repository.saveProfile(
            userA,
            {
              targetRole:
                "Software Engineer",
            }
          );
  
          await repository.saveProfile(
            userB,
            {
              targetRole:
                "Data Analyst",
            }
          );
  
          await repository.createOrReplaceRoadmap(
            userA,
            {
              title:
                "Software Engineer Roadmap",
              targetRole:
                "Software Engineer",
              estimatedWeeks: 8,
              milestones: [
                {
                  order: 1,
                  title:
                    "Foundations",
                  description:
                    "Learn foundations.",
                  estimatedHours:
                    5,
                  skills: [
                    "JavaScript",
                  ],
                  status:
                    "not-started",
                },
              ],
            }
          );
  
          await repository.resetDemoData(
            userA
          );
  
          expect(
            await repository.getProfile(
              userA
            )
          ).toBeNull();
  
          expect(
            await repository.getActiveRoadmap(
              userA
            )
          ).toBeNull();
  
          expect(
            await repository.getProfile(
              userB
            )
          ).toMatchObject({
            targetRole:
              "Data Analyst",
          });
  
          const userRow =
            await pool.query(
              `
                SELECT id
                FROM users
                WHERE id = $1
              `,
              [userA]
            );
  
          expect(
            userRow.rowCount
          ).toBe(1);
        }
      );
    }
  );