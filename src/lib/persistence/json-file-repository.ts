import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  MilestoneRecord,
  MilestoneStatus,
  PersistenceState,
  QuestionnaireInput,
  QuestionnaireRecord,
  RoadmapInput,
  RoadmapRecord,
} from "./domain";

import {
  createEmptyPersistenceState,
} from "./domain";

import {
  PersistenceCorruptionError,
  PersistenceNotFoundError,
  PersistenceValidationError,
} from "./errors";

import type {
  CareerRepository,
} from "./repository";

import {
  normalizeQuestionnaire,
  normalizeRoadmap,
  normalizeUserId,
} from "./validation";

export class JsonFileCareerRepository
  implements CareerRepository
{
  private readonly filePath: string;

  /**
   * Serializes mutations inside the current Node.js process.
   *
   * This avoids two requests reading the same state and overwriting
   * each other's changes during local development.
   */
  private writeChain: Promise<void> = Promise.resolve();

  constructor(filePath?: string) {
    this.filePath =
      filePath ??
      path.join(
        process.cwd(),
        ".careerlm",
        "data.json"
      );
  }

  private async readState(): Promise<PersistenceState> {
    try {
      const raw = await readFile(
        this.filePath,
        "utf8"
      );

      const parsed = JSON.parse(raw) as unknown;

      if (
        typeof parsed !== "object" ||
        parsed === null
      ) {
        throw new PersistenceCorruptionError(
          "CareerLM persistence data is not a valid object."
        );
      }

      const candidate =
        parsed as Partial<PersistenceState>;

      if (candidate.schemaVersion !== 1) {
        throw new PersistenceCorruptionError(
          "Unsupported CareerLM persistence schema version."
        );
      }

      if (
        typeof candidate.users !== "object" ||
        candidate.users === null
      ) {
        throw new PersistenceCorruptionError(
          "CareerLM persistence data does not contain a valid users object."
        );
      }

      return candidate as PersistenceState;
    } catch (error) {
      const filesystemError =
        error as NodeJS.ErrnoException;

      if (filesystemError.code === "ENOENT") {
        return createEmptyPersistenceState();
      }

      if (
        error instanceof PersistenceCorruptionError
      ) {
        throw error;
      }

      if (error instanceof SyntaxError) {
        throw new PersistenceCorruptionError(
          "CareerLM persistence data contains invalid JSON."
        );
      }

      throw error;
    }
  }

  /**
   * Uses a temporary file + rename rather than writing directly over
   * the persistence file.
   *
   * A failed write is therefore less likely to leave a partially written
   * JSON document.
   */
  private async writeState(
    state: PersistenceState
  ): Promise<void> {
    const directory = path.dirname(
      this.filePath
    );

    await mkdir(directory, {
      recursive: true,
    });

    const temporaryPath =
      `${this.filePath}.${process.pid}.${Date.now()}.tmp`;

    await writeFile(
      temporaryPath,
      `${JSON.stringify(state, null, 2)}\n`,
      "utf8"
    );

    await rename(
      temporaryPath,
      this.filePath
    );
  }

  /**
   * Provides a basic process-level mutation lock.
   */
  private async mutate<T>(
    callback: (
      state: PersistenceState
    ) => Promise<T> | T
  ): Promise<T> {
    let releaseLock!: () => void;

    const previousWrite =
      this.writeChain;

    this.writeChain =
      new Promise<void>((resolve) => {
        releaseLock = resolve;
      });

    await previousWrite;

    try {
      const state = await this.readState();

      const result =
        await callback(state);

      await this.writeState(state);

      return structuredClone(result);
    } finally {
      releaseLock();
    }
  }

  async saveQuestionnaire(
    userId: string,
    input: QuestionnaireInput
  ): Promise<QuestionnaireRecord> {
    const normalizedUserId =
      normalizeUserId(userId);

    const questionnaire =
      normalizeQuestionnaire(input);

    return this.mutate(
      async (state) => {
        const now =
          new Date().toISOString();

        const currentUser =
          state.users[normalizedUserId] ?? {};

        const existing =
          currentUser.questionnaire;

        const record: QuestionnaireRecord = {
          ...questionnaire,

          userId: normalizedUserId,

          schemaVersion: 1,

          createdAt:
            existing?.createdAt ?? now,

          updatedAt: now,
        };

        state.users[normalizedUserId] = {
          ...currentUser,
          questionnaire: record,
        };

        return record;
      }
    );
  }

  async getQuestionnaire(
    userId: string
  ): Promise<QuestionnaireRecord | null> {
    const normalizedUserId =
      normalizeUserId(userId);

    const state =
      await this.readState();

    const questionnaire =
      state.users[normalizedUserId]
        ?.questionnaire;

    return questionnaire
      ? structuredClone(questionnaire)
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

    return this.mutate(
      async (state) => {
        const now =
          new Date().toISOString();

        const milestones: MilestoneRecord[] =
          roadmap.milestones.map(
            (milestone) => ({
              order: milestone.order,

              id:
                milestone.id ??
                randomUUID(),

              title: milestone.title,

              description:
                milestone.description,

              estimatedHours:
                milestone.estimatedHours,

              skills: [
                ...milestone.skills,
              ],

              status: milestone.status,
            })
          );

        const record: RoadmapRecord = {
          id: randomUUID(),

          userId: normalizedUserId,

          title: roadmap.title,

          targetRole:
            roadmap.targetRole,

          estimatedWeeks:
            roadmap.estimatedWeeks,

          milestones,

          createdAt: now,

          updatedAt: now,
        };

        const currentUser =
          state.users[normalizedUserId] ?? {};

        /**
         * Deliberately replaces the user's active roadmap.
         *
         * Sprint 2 requires one active roadmap per user rather than
         * accumulating multiple competing active roadmaps.
         */
        state.users[normalizedUserId] = {
          ...currentUser,
          activeRoadmap: record,
        };

        return record;
      }
    );
  }

  async getActiveRoadmap(
    userId: string
  ): Promise<RoadmapRecord | null> {
    const normalizedUserId =
      normalizeUserId(userId);

    const state =
      await this.readState();

    const roadmap =
      state.users[normalizedUserId]
        ?.activeRoadmap;

    return roadmap
      ? structuredClone(roadmap)
      : null;
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

    if (!allowedStatuses.has(status)) {
      throw new PersistenceValidationError(
        `Invalid milestone status: ${status}`
      );
    }

    return this.mutate(
      async (state) => {
        const user =
          state.users[normalizedUserId];

        const roadmap =
          user?.activeRoadmap;

        if (!roadmap) {
          throw new PersistenceNotFoundError(
            `No active roadmap exists for user ${normalizedUserId}.`
          );
        }

        const milestone =
          roadmap.milestones.find(
            (candidate) =>
              candidate.id ===
              normalizedMilestoneId
          );

        if (!milestone) {
          throw new PersistenceNotFoundError(
            `Milestone ${normalizedMilestoneId} was not found.`
          );
        }

        milestone.status = status;

        roadmap.updatedAt =
          new Date().toISOString();

        return roadmap;
      }
    );
  }

  async resetDemoData(
    userId: string
  ): Promise<void> {
    const normalizedUserId =
      normalizeUserId(userId);

    await this.mutate(
      async (state) => {
        delete state.users[
          normalizedUserId
        ];
      }
    );
  }
}