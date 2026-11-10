import {
    randomUUID,
  } from "node:crypto";
  
  import type {
    Pool,
    PoolClient,
    QueryResultRow,
  } from "pg";
  
  import type {
    ExperienceLevel,
    JobPreferencesInput,
    JobPreferencesRecord,
    MilestoneRecord,
    MilestoneStatus,
    ProfileInput,
    ProfileRecord,
    QuestionnaireInput,
    QuestionnaireRecord,
    ResumeInput,
    ResumeRecord,
    RoadmapInput,
    RoadmapRecord,
  } from "./domain";
  
  import {
    PersistenceCorruptionError,
    PersistenceNotFoundError,
    PersistenceValidationError,
  } from "./errors";
  
  import {
    normalizeJobPreferences,
  } from "./job-preferences-validation";
  
  import type {
    CareerRepository,
  } from "./repository";
  
  import {
    normalizeProfile,
    normalizeQuestionnaire,
    normalizeResume,
    normalizeRoadmap,
    normalizeUserId,
  } from "./validation";
  
  interface ProfileRow
    extends QueryResultRow {
    user_id: string;
    name: string | null;
    target_role: string | null;
    experience_level:
      ExperienceLevel | null;
    schema_version: number;
    created_at: Date | string;
    updated_at: Date | string;
  }
  
  interface QuestionnaireRow
    extends QueryResultRow {
    user_id: string;
    target_role: string;
    experience_level:
      ExperienceLevel;
    existing_skills: string[];
    learning_style: string;
    weekly_hours: number;
    additional_responses:
      QuestionnaireRecord["additionalResponses"] | null;
    schema_version: number;
    created_at: Date | string;
    updated_at: Date | string;
  }
  
  interface ResumeRow
    extends QueryResultRow {
    user_id: string;
    normalized_text: string;
    sections:
      ResumeRecord["sections"];
    schema_version: number;
    created_at: Date | string;
    updated_at: Date | string;
  }
  
  interface JobPreferencesRow
    extends QueryResultRow {
    user_id: string;
    keywords: string;
    location: string | null;
    workplace_types:
      JobPreferencesRecord["workplaceTypes"];
    employment_types:
      JobPreferencesRecord["employmentTypes"];
    experience_levels:
      JobPreferencesRecord["experienceLevels"];
    use_resume_for_matching: boolean;
    use_portfolio_for_matching: boolean;
    schema_version: number;
    created_at: Date | string;
    updated_at: Date | string;
  }
  
  interface RoadmapRow
    extends QueryResultRow {
    id: string;
    user_id: string;
    title: string;
    target_role: string;
    estimated_weeks: number;
    created_at: Date | string;
    updated_at: Date | string;
  }
  
  interface MilestoneRow
    extends QueryResultRow {
    id: string;
    milestone_order: number;
    title: string;
    description: string;
    estimated_hours: number;
    skills: string[];
    status: MilestoneStatus;
  }
  
  interface IdRow
    extends QueryResultRow {
    id: string;
  }
  
  function toIsoTimestamp(
    value: Date | string
  ): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
  
    return new Date(
      value
    ).toISOString();
  }
  
  function assertSchemaVersionOne(
    version: number,
    entityName: string
  ): void {
    if (version !== 1) {
      throw new PersistenceCorruptionError(
        `${entityName} uses unsupported schema version ${version}.`
      );
    }
  }
  
  function profileRowToRecord(
    row: ProfileRow
  ): ProfileRecord {
    assertSchemaVersionOne(
      row.schema_version,
      "Profile"
    );
  
    const record: ProfileRecord = {
      userId: row.user_id,
      schemaVersion: 1,
      createdAt:
        toIsoTimestamp(
          row.created_at
        ),
      updatedAt:
        toIsoTimestamp(
          row.updated_at
        ),
    };
  
    if (row.name !== null) {
      record.name = row.name;
    }
  
    if (
      row.target_role !== null
    ) {
      record.targetRole =
        row.target_role;
    }
  
    if (
      row.experience_level !==
      null
    ) {
      record.experienceLevel =
        row.experience_level;
    }
  
    return record;
  }
  
  function questionnaireRowToRecord(
    row: QuestionnaireRow
  ): QuestionnaireRecord {
    assertSchemaVersionOne(
      row.schema_version,
      "Questionnaire"
    );
  
    const record:
      QuestionnaireRecord = {
        userId: row.user_id,
        targetRole:
          row.target_role,
        experienceLevel:
          row.experience_level,
        existingSkills: [
          ...row.existing_skills,
        ],
        learningStyle:
          row.learning_style,
        weeklyHours:
          row.weekly_hours,
        schemaVersion: 1,
        createdAt:
          toIsoTimestamp(
            row.created_at
          ),
        updatedAt:
          toIsoTimestamp(
            row.updated_at
          ),
      };
  
    if (
      row.additional_responses !==
      null
    ) {
      record.additionalResponses =
        structuredClone(
          row.additional_responses
        );
    }
  
    return record;
  }
  
  function resumeRowToRecord(
    row: ResumeRow
  ): ResumeRecord {
    assertSchemaVersionOne(
      row.schema_version,
      "Resume"
    );
  
    return {
      userId: row.user_id,
      normalizedText:
        row.normalized_text,
      sections:
        structuredClone(
          row.sections
        ),
      schemaVersion: 1,
      createdAt:
        toIsoTimestamp(
          row.created_at
        ),
      updatedAt:
        toIsoTimestamp(
          row.updated_at
        ),
    };
  }
  
  function jobPreferencesRowToRecord(
    row: JobPreferencesRow
  ): JobPreferencesRecord {
    assertSchemaVersionOne(
      row.schema_version,
      "Job preferences"
    );
  
    const record:
      JobPreferencesRecord = {
        userId: row.user_id,
        keywords: row.keywords,
        workplaceTypes: [
          ...row.workplace_types,
        ],
        employmentTypes: [
          ...row.employment_types,
        ],
        experienceLevels: [
          ...row.experience_levels,
        ],
        useResumeForMatching:
          row.use_resume_for_matching,
        usePortfolioForMatching:
          row.use_portfolio_for_matching,
        schemaVersion: 1,
        createdAt:
          toIsoTimestamp(
            row.created_at
          ),
        updatedAt:
          toIsoTimestamp(
            row.updated_at
          ),
      };
  
    if (row.location !== null) {
      record.location =
        row.location;
    }
  
    return record;
  }
  
  function milestoneRowToRecord(
    row: MilestoneRow
  ): MilestoneRecord {
    return {
      id: row.id,
      order:
        row.milestone_order,
      title: row.title,
      description:
        row.description,
      estimatedHours:
        row.estimated_hours,
      skills: [
        ...row.skills,
      ],
      status: row.status,
    };
  }
  
  /**
   * PostgreSQL-backed implementation of the storage-independent
   * CareerRepository contract.
   *
   * Application services continue depending on CareerRepository rather
   * than PostgreSQL directly.
   */
  export class PostgresCareerRepository
    implements CareerRepository
  {
    constructor(
      private readonly pool:
        Pool
    ) {}
  
    private async withTransaction<T>(
      callback: (
        client: PoolClient
      ) => Promise<T>
    ): Promise<T> {
      const client =
        await this.pool.connect();
  
      try {
        await client.query(
          "BEGIN"
        );
  
        const result =
          await callback(
            client
          );
  
        await client.query(
          "COMMIT"
        );
  
        return result;
      } catch (error) {
        await client.query(
          "ROLLBACK"
        );
  
        throw error;
      } finally {
        client.release();
      }
    }
  
    private async ensureUser(
      client: PoolClient,
      userId: string
    ): Promise<void> {
      await client.query(
        `
          INSERT INTO users (
            id
          )
          VALUES ($1)
          ON CONFLICT (id)
          DO NOTHING
        `,
        [userId]
      );
    }
  
    private async getActiveRoadmapWithClient(
      client: PoolClient,
      userId: string
    ): Promise<RoadmapRecord | null> {
      const roadmapResult =
        await client.query<RoadmapRow>(
          `
            SELECT
              id,
              user_id,
              title,
              target_role,
              estimated_weeks,
              created_at,
              updated_at
            FROM roadmaps
            WHERE user_id = $1
          `,
          [userId]
        );
  
      const roadmapRow =
        roadmapResult.rows[0];
  
      if (!roadmapRow) {
        return null;
      }
  
      const milestoneResult =
        await client.query<MilestoneRow>(
          `
            SELECT
              id,
              milestone_order,
              title,
              description,
              estimated_hours,
              skills,
              status
            FROM milestones
            WHERE roadmap_id = $1
            ORDER BY milestone_order ASC
          `,
          [roadmapRow.id]
        );
  
      return {
        id: roadmapRow.id,
        userId:
          roadmapRow.user_id,
        title:
          roadmapRow.title,
        targetRole:
          roadmapRow.target_role,
        estimatedWeeks:
          roadmapRow.estimated_weeks,
        milestones:
          milestoneResult.rows.map(
            milestoneRowToRecord
          ),
        createdAt:
          toIsoTimestamp(
            roadmapRow.created_at
          ),
        updatedAt:
          toIsoTimestamp(
            roadmapRow.updated_at
          ),
      };
    }
  
    async saveProfile(
      userId: string,
      input: ProfileInput
    ): Promise<ProfileRecord> {
      const normalizedUserId =
        normalizeUserId(userId);
  
      const profile =
        normalizeProfile(input);
  
      return this.withTransaction(
        async (client) => {
          await this.ensureUser(
            client,
            normalizedUserId
          );
  
          const result =
            await client.query<ProfileRow>(
              `
                INSERT INTO profiles (
                  user_id,
                  name,
                  target_role,
                  experience_level,
                  schema_version,
                  created_at,
                  updated_at
                )
                VALUES (
                  $1,
                  $2,
                  $3,
                  $4,
                  1,
                  NOW(),
                  NOW()
                )
                ON CONFLICT (user_id)
                DO UPDATE SET
                  name =
                    EXCLUDED.name,
                  target_role =
                    EXCLUDED.target_role,
                  experience_level =
                    EXCLUDED.experience_level,
                  schema_version = 1,
                  updated_at = NOW()
                RETURNING
                  user_id,
                  name,
                  target_role,
                  experience_level,
                  schema_version,
                  created_at,
                  updated_at
              `,
              [
                normalizedUserId,
                profile.name ??
                  null,
                profile.targetRole ??
                  null,
                profile.experienceLevel ??
                  null,
              ]
            );
  
          return profileRowToRecord(
            result.rows[0]
          );
        }
      );
    }
  
    async getProfile(
      userId: string
    ): Promise<ProfileRecord | null> {
      const normalizedUserId =
        normalizeUserId(userId);
  
      const result =
        await this.pool.query<ProfileRow>(
          `
            SELECT
              user_id,
              name,
              target_role,
              experience_level,
              schema_version,
              created_at,
              updated_at
            FROM profiles
            WHERE user_id = $1
          `,
          [normalizedUserId]
        );
  
      const row =
        result.rows[0];
  
      return row
        ? profileRowToRecord(
            row
          )
        : null;
    }
  
    async saveResume(
      userId: string,
      input: ResumeInput
    ): Promise<ResumeRecord> {
      const normalizedUserId =
        normalizeUserId(userId);
  
      const resume =
        normalizeResume(input);
  
      return this.withTransaction(
        async (client) => {
          await this.ensureUser(
            client,
            normalizedUserId
          );
  
          const result =
            await client.query<ResumeRow>(
              `
                INSERT INTO resumes (
                  user_id,
                  normalized_text,
                  sections,
                  schema_version,
                  created_at,
                  updated_at
                )
                VALUES (
                  $1,
                  $2,
                  $3::jsonb,
                  1,
                  NOW(),
                  NOW()
                )
                ON CONFLICT (user_id)
                DO UPDATE SET
                  normalized_text =
                    EXCLUDED.normalized_text,
                  sections =
                    EXCLUDED.sections,
                  schema_version = 1,
                  updated_at = NOW()
                RETURNING
                  user_id,
                  normalized_text,
                  sections,
                  schema_version,
                  created_at,
                  updated_at
              `,
              [
                normalizedUserId,
                resume.normalizedText,
                JSON.stringify(
                  resume.sections
                ),
              ]
            );
  
          return resumeRowToRecord(
            result.rows[0]
          );
        }
      );
    }
  
    async getResume(
      userId: string
    ): Promise<ResumeRecord | null> {
      const normalizedUserId =
        normalizeUserId(userId);
  
      const result =
        await this.pool.query<ResumeRow>(
          `
            SELECT
              user_id,
              normalized_text,
              sections,
              schema_version,
              created_at,
              updated_at
            FROM resumes
            WHERE user_id = $1
          `,
          [normalizedUserId]
        );
  
      const row =
        result.rows[0];
  
      return row
        ? resumeRowToRecord(row)
        : null;
    }
  
    async deleteResume(
      userId: string
    ): Promise<void> {
      const normalizedUserId =
        normalizeUserId(userId);
  
      await this.pool.query(
        `
          DELETE FROM resumes
          WHERE user_id = $1
        `,
        [normalizedUserId]
      );
    }
  
    async saveJobPreferences(
      userId: string,
      input: JobPreferencesInput
    ): Promise<JobPreferencesRecord> {
      const normalizedUserId =
        normalizeUserId(userId);
  
      const preferences =
        normalizeJobPreferences(
          input
        );
  
      return this.withTransaction(
        async (client) => {
          await this.ensureUser(
            client,
            normalizedUserId
          );
  
          const result =
            await client.query<JobPreferencesRow>(
              `
                INSERT INTO job_preferences (
                  user_id,
                  keywords,
                  location,
                  workplace_types,
                  employment_types,
                  experience_levels,
                  use_resume_for_matching,
                  use_portfolio_for_matching,
                  schema_version,
                  created_at,
                  updated_at
                )
                VALUES (
                  $1,
                  $2,
                  $3,
                  $4::jsonb,
                  $5::jsonb,
                  $6::jsonb,
                  $7,
                  $8,
                  1,
                  NOW(),
                  NOW()
                )
                ON CONFLICT (user_id)
                DO UPDATE SET
                  keywords =
                    EXCLUDED.keywords,
                  location =
                    EXCLUDED.location,
                  workplace_types =
                    EXCLUDED.workplace_types,
                  employment_types =
                    EXCLUDED.employment_types,
                  experience_levels =
                    EXCLUDED.experience_levels,
                  use_resume_for_matching =
                    EXCLUDED.use_resume_for_matching,
                  use_portfolio_for_matching =
                    EXCLUDED.use_portfolio_for_matching,
                  schema_version = 1,
                  updated_at = NOW()
                RETURNING
                  user_id,
                  keywords,
                  location,
                  workplace_types,
                  employment_types,
                  experience_levels,
                  use_resume_for_matching,
                  use_portfolio_for_matching,
                  schema_version,
                  created_at,
                  updated_at
              `,
              [
                normalizedUserId,
                preferences.keywords,
                preferences.location ??
                  null,
                JSON.stringify(
                  preferences.workplaceTypes
                ),
                JSON.stringify(
                  preferences.employmentTypes
                ),
                JSON.stringify(
                  preferences.experienceLevels
                ),
                preferences.useResumeForMatching,
                preferences.usePortfolioForMatching,
              ]
            );
  
          return jobPreferencesRowToRecord(
            result.rows[0]
          );
        }
      );
    }
  
    async getJobPreferences(
      userId: string
    ): Promise<JobPreferencesRecord | null> {
      const normalizedUserId =
        normalizeUserId(userId);
  
      const result =
        await this.pool.query<JobPreferencesRow>(
          `
            SELECT
              user_id,
              keywords,
              location,
              workplace_types,
              employment_types,
              experience_levels,
              use_resume_for_matching,
              use_portfolio_for_matching,
              schema_version,
              created_at,
              updated_at
            FROM job_preferences
            WHERE user_id = $1
          `,
          [normalizedUserId]
        );
  
      const row =
        result.rows[0];
  
      return row
        ? jobPreferencesRowToRecord(
            row
          )
        : null;
    }
  
    async saveQuestionnaire(
      userId: string,
      input: QuestionnaireInput
    ): Promise<QuestionnaireRecord> {
      const normalizedUserId =
        normalizeUserId(userId);
  
      const questionnaire =
        normalizeQuestionnaire(
          input
        );
  
      return this.withTransaction(
        async (client) => {
          await this.ensureUser(
            client,
            normalizedUserId
          );
  
          const additionalResponses =
            questionnaire.additionalResponses ===
            undefined
              ? null
              : JSON.stringify(
                  questionnaire.additionalResponses
                );
  
          const result =
            await client.query<QuestionnaireRow>(
              `
                INSERT INTO questionnaires (
                  user_id,
                  target_role,
                  experience_level,
                  existing_skills,
                  learning_style,
                  weekly_hours,
                  additional_responses,
                  schema_version,
                  created_at,
                  updated_at
                )
                VALUES (
                  $1,
                  $2,
                  $3,
                  $4::jsonb,
                  $5,
                  $6,
                  $7::jsonb,
                  1,
                  NOW(),
                  NOW()
                )
                ON CONFLICT (user_id)
                DO UPDATE SET
                  target_role =
                    EXCLUDED.target_role,
                  experience_level =
                    EXCLUDED.experience_level,
                  existing_skills =
                    EXCLUDED.existing_skills,
                  learning_style =
                    EXCLUDED.learning_style,
                  weekly_hours =
                    EXCLUDED.weekly_hours,
                  additional_responses =
                    EXCLUDED.additional_responses,
                  schema_version = 1,
                  updated_at = NOW()
                RETURNING
                  user_id,
                  target_role,
                  experience_level,
                  existing_skills,
                  learning_style,
                  weekly_hours,
                  additional_responses,
                  schema_version,
                  created_at,
                  updated_at
              `,
              [
                normalizedUserId,
                questionnaire.targetRole,
                questionnaire.experienceLevel,
                JSON.stringify(
                  questionnaire.existingSkills
                ),
                questionnaire.learningStyle,
                questionnaire.weeklyHours,
                additionalResponses,
              ]
            );
  
          return questionnaireRowToRecord(
            result.rows[0]
          );
        }
      );
    }
  
    async getQuestionnaire(
      userId: string
    ): Promise<QuestionnaireRecord | null> {
      const normalizedUserId =
        normalizeUserId(userId);
  
      const result =
        await this.pool.query<QuestionnaireRow>(
          `
            SELECT
              user_id,
              target_role,
              experience_level,
              existing_skills,
              learning_style,
              weekly_hours,
              additional_responses,
              schema_version,
              created_at,
              updated_at
            FROM questionnaires
            WHERE user_id = $1
          `,
          [normalizedUserId]
        );
  
      const row =
        result.rows[0];
  
      return row
        ? questionnaireRowToRecord(
            row
          )
        : null;
    }
  
    async createOrReplaceRoadmap(
      userId: string,
      input: RoadmapInput
    ): Promise<RoadmapRecord> {
      const normalizedUserId =
        normalizeUserId(userId);
  
      const roadmap =
        normalizeRoadmap(input);
  
      return this.withTransaction(
        async (client) => {
          await this.ensureUser(
            client,
            normalizedUserId
          );
  
          await client.query(
            `
              DELETE FROM roadmaps
              WHERE user_id = $1
            `,
            [normalizedUserId]
          );
  
          const roadmapId =
            randomUUID();
  
          const roadmapResult =
            await client.query<RoadmapRow>(
              `
                INSERT INTO roadmaps (
                  id,
                  user_id,
                  title,
                  target_role,
                  estimated_weeks,
                  created_at,
                  updated_at
                )
                VALUES (
                  $1,
                  $2,
                  $3,
                  $4,
                  $5,
                  NOW(),
                  NOW()
                )
                RETURNING
                  id,
                  user_id,
                  title,
                  target_role,
                  estimated_weeks,
                  created_at,
                  updated_at
              `,
              [
                roadmapId,
                normalizedUserId,
                roadmap.title,
                roadmap.targetRole,
                roadmap.estimatedWeeks,
              ]
            );
  
          const milestones:
            MilestoneRecord[] =
            [];
  
          for (
            const milestone
            of roadmap.milestones
          ) {
            const milestoneId =
              milestone.id ??
              randomUUID();
  
            const result =
              await client.query<MilestoneRow>(
                `
                  INSERT INTO milestones (
                    id,
                    roadmap_id,
                    milestone_order,
                    title,
                    description,
                    estimated_hours,
                    skills,
                    status
                  )
                  VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7::jsonb,
                    $8
                  )
                  RETURNING
                    id,
                    milestone_order,
                    title,
                    description,
                    estimated_hours,
                    skills,
                    status
                `,
                [
                  milestoneId,
                  roadmapId,
                  milestone.order,
                  milestone.title,
                  milestone.description,
                  milestone.estimatedHours,
                  JSON.stringify(
                    milestone.skills
                  ),
                  milestone.status,
                ]
              );
  
            milestones.push(
              milestoneRowToRecord(
                result.rows[0]
              )
            );
          }
  
          const storedRoadmap =
            roadmapResult.rows[0];
  
          return {
            id: storedRoadmap.id,
            userId:
              storedRoadmap.user_id,
            title:
              storedRoadmap.title,
            targetRole:
              storedRoadmap.target_role,
            estimatedWeeks:
              storedRoadmap.estimated_weeks,
            milestones,
            createdAt:
              toIsoTimestamp(
                storedRoadmap.created_at
              ),
            updatedAt:
              toIsoTimestamp(
                storedRoadmap.updated_at
              ),
          };
        }
      );
    }
  
    async getActiveRoadmap(
      userId: string
    ): Promise<RoadmapRecord | null> {
      const normalizedUserId =
        normalizeUserId(userId);
  
      const client =
        await this.pool.connect();
  
      try {
        return await this.getActiveRoadmapWithClient(
          client,
          normalizedUserId
        );
      } finally {
        client.release();
      }
    }
  
    async updateMilestoneStatus(
      userId: string,
      milestoneId: string,
      status: MilestoneStatus
    ): Promise<RoadmapRecord> {
      const normalizedUserId =
        normalizeUserId(userId);
  
      const normalizedMilestoneId =
        milestoneId.trim();
  
      if (!normalizedMilestoneId) {
        throw new PersistenceValidationError(
          "A milestone ID is required."
        );
      }
  
      const allowedStatuses =
        new Set<MilestoneStatus>([
          "not-started",
          "in-progress",
          "completed",
        ]);
  
      if (
        !allowedStatuses.has(
          status
        )
      ) {
        throw new PersistenceValidationError(
          `Invalid milestone status: ${status}`
        );
      }
  
      return this.withTransaction(
        async (client) => {
          const roadmapResult =
            await client.query<IdRow>(
              `
                SELECT id
                FROM roadmaps
                WHERE user_id = $1
                FOR UPDATE
              `,
              [normalizedUserId]
            );
  
          const activeRoadmap =
            roadmapResult.rows[0];
  
          if (!activeRoadmap) {
            throw new PersistenceNotFoundError(
              `No active roadmap exists for user ${normalizedUserId}.`
            );
          }
  
          const updateResult =
            await client.query(
              `
                UPDATE milestones
                SET status = $1
                WHERE roadmap_id = $2
                  AND id = $3
              `,
              [
                status,
                activeRoadmap.id,
                normalizedMilestoneId,
              ]
            );
  
          if (
            updateResult.rowCount ===
            0
          ) {
            throw new PersistenceNotFoundError(
              `Milestone ${normalizedMilestoneId} was not found.`
            );
          }
  
          await client.query(
            `
              UPDATE roadmaps
              SET updated_at = NOW()
              WHERE id = $1
            `,
            [activeRoadmap.id]
          );
  
          const updatedRoadmap =
            await this.getActiveRoadmapWithClient(
              client,
              normalizedUserId
            );
  
          if (!updatedRoadmap) {
            throw new PersistenceNotFoundError(
              `No active roadmap exists for user ${normalizedUserId}.`
            );
          }
  
          return updatedRoadmap;
        }
      );
    }
  
    async resetDemoData(
      userId: string
    ): Promise<void> {
      const normalizedUserId =
        normalizeUserId(userId);
  
      await this.withTransaction(
        async (client) => {
          await client.query(
            `
              DELETE FROM profiles
              WHERE user_id = $1
            `,
            [normalizedUserId]
          );
  
          await client.query(
            `
              DELETE FROM questionnaires
              WHERE user_id = $1
            `,
            [normalizedUserId]
          );
  
          await client.query(
            `
              DELETE FROM resumes
              WHERE user_id = $1
            `,
            [normalizedUserId]
          );
  
          await client.query(
            `
              DELETE FROM job_preferences
              WHERE user_id = $1
            `,
            [normalizedUserId]
          );
  
          await client.query(
            `
              DELETE FROM roadmaps
              WHERE user_id = $1
            `,
            [normalizedUserId]
          );
        }
      );
    }
  }