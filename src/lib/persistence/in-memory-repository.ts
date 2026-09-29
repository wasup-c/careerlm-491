import { randomUUID } from "node:crypto";

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

/**
 * In-memory implementation of the CareerRepository contract.
 *
 * This adapter is useful for:
 * - automated tests
 * - service-layer tests
 * - Sprint 3 session/user integration tests
 * - development scenarios that do not require filesystem persistence
 *
 * Data exists only for the lifetime of this repository instance.
 */
export class InMemoryCareerRepository
  implements CareerRepository
{
  private state: PersistenceState =
    createEmptyPersistenceState();

  async saveQuestionnaire(
    userId: string,
    input: QuestionnaireInput
  ): Promise<QuestionnaireRecord> {
    const normalizedUserId =
      normalizeUserId(userId);

    const questionnaire =
      normalizeQuestionnaire(input);

    const now =
      new Date().toISOString();

    const currentUser =
      this.state.users[normalizedUserId] ?? {};

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

    this.state.users[normalizedUserId] = {
      ...currentUser,
      questionnaire: record,
    };

    return structuredClone(record);
  }

  async getQuestionnaire(
    userId: string
  ): Promise<QuestionnaireRecord | null> {
    const normalizedUserId =
      normalizeUserId(userId);

    const questionnaire =
      this.state.users[normalizedUserId]
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
      this.state.users[normalizedUserId] ?? {};

    this.state.users[normalizedUserId] = {
      ...currentUser,
      activeRoadmap: record,
    };

    return structuredClone(record);
  }

  async getActiveRoadmap(
    userId: string
  ): Promise<RoadmapRecord | null> {
    const normalizedUserId =
      normalizeUserId(userId);

    const roadmap =
      this.state.users[normalizedUserId]
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

    const user =
      this.state.users[normalizedUserId];

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

    return structuredClone(roadmap);
  }

  async resetDemoData(
    userId: string
  ): Promise<void> {
    const normalizedUserId =
      normalizeUserId(userId);

    delete this.state.users[
      normalizedUserId
    ];
  }
}