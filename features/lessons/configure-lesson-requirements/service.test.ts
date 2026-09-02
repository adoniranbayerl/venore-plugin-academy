import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findLessonById = vi.fn();
const countLessonActivities = vi.fn();
const upsertLessonRequirements = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  countLessonActivities: (...args: unknown[]) => countLessonActivities(...args),
  upsertLessonRequirements: (...args: unknown[]) => upsertLessonRequirements(...args),
}));

const lessonWithoutVideo = {
  id: "lesson-1",
  courseId: "course-1",
  cmsEntryId: "entry-1",
  videoUrl: null,
  position: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("configureLessonRequirements", () => {
  beforeEach(() => {
    findLessonById.mockReset();
    countLessonActivities.mockReset();
    upsertLessonRequirements.mockReset();
  });

  it("fails when the lesson does not exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { configureLessonRequirements } = await import("./service");
    const result = await configureLessonRequirements({
      lessonId: "missing",
      readTextEnabled: false,
      watchVideoEnabled: false,
      quizEnabled: false,
      activityEnabled: false,
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: false, error: { code: "academy.lessons.not_found", message: expect.any(String) } });
    expect(upsertLessonRequirements).not.toHaveBeenCalled();
  });

  it("fails to enable watchVideoEnabled when the lesson has no videoUrl", async () => {
    findLessonById.mockResolvedValue(lessonWithoutVideo);

    const { configureLessonRequirements } = await import("./service");
    const result = await configureLessonRequirements({
      lessonId: "lesson-1",
      readTextEnabled: false,
      watchVideoEnabled: true,
      quizEnabled: false,
      activityEnabled: false,
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lessons.missing_video_url", message: expect.any(String) },
    });
    expect(upsertLessonRequirements).not.toHaveBeenCalled();
  });

  it("fails to enable activityEnabled when the lesson has no lesson activity", async () => {
    findLessonById.mockResolvedValue(lessonWithoutVideo);
    countLessonActivities.mockResolvedValue(0);

    const { configureLessonRequirements } = await import("./service");
    const result = await configureLessonRequirements({
      lessonId: "lesson-1",
      readTextEnabled: false,
      watchVideoEnabled: false,
      quizEnabled: false,
      activityEnabled: true,
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lessons.missing_lesson_activity", message: expect.any(String) },
    });
    expect(upsertLessonRequirements).not.toHaveBeenCalled();
  });

  it("upserts the requirements idempotently when valid", async () => {
    findLessonById.mockResolvedValue(lessonWithoutVideo);
    upsertLessonRequirements.mockResolvedValue({
      lessonId: "lesson-1",
      readTextEnabled: true,
      watchVideoEnabled: false,
      quizEnabled: false,
      quizPassThresholdPercent: null,
      quizMaxAttempts: null,
      activityEnabled: false,
      updatedAt: new Date(),
    });

    const { configureLessonRequirements } = await import("./service");
    const command = {
      lessonId: "lesson-1",
      readTextEnabled: true,
      watchVideoEnabled: false,
      quizEnabled: false,
      activityEnabled: false,
      actorId: "actor-1",
    };

    const first = await configureLessonRequirements(command);
    const second = await configureLessonRequirements(command);

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(upsertLessonRequirements).toHaveBeenCalledTimes(2);
  });
});
