import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findLessonRequirements = vi.fn();
const isLessonAccessible = vi.fn();

vi.mock("../../../shared/lesson-progress", () => ({
  findLessonRequirements: (...args: unknown[]) => findLessonRequirements(...args),
  isLessonAccessible: (...args: unknown[]) => isLessonAccessible(...args),
}));

const isEnrolled = vi.fn();

vi.mock("../../../shared/enrollment", () => ({
  isEnrolled: (...args: unknown[]) => isEnrolled(...args),
}));

vi.mock("../../../shared/progress-hooks", () => ({ onProgressAdvanced: vi.fn() }));

const findLessonById = vi.fn();
const insertVideoCompletionIfMissing = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  insertVideoCompletionIfMissing: (...args: unknown[]) => insertVideoCompletionIfMissing(...args),
}));

const lesson = { id: "lesson-1", courseId: "course-1", position: 1 };

describe("markVideoWatched", () => {
  beforeEach(() => {
    findLessonById.mockReset();
    isLessonAccessible.mockReset();
    isEnrolled.mockReset();
    findLessonRequirements.mockReset();
    insertVideoCompletionIfMissing.mockReset();

    findLessonById.mockResolvedValue(lesson);
    isEnrolled.mockResolvedValue(true);
    isLessonAccessible.mockResolvedValue(true);
  });

  it("fails when the actor is not enrolled, even if the lesson would otherwise be unlocked", async () => {
    isEnrolled.mockResolvedValue(false);

    const { markVideoWatched } = await import("./service");
    const result = await markVideoWatched({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.not_enrolled", message: expect.any(String) },
    });
    expect(isLessonAccessible).not.toHaveBeenCalled();
    expect(insertVideoCompletionIfMissing).not.toHaveBeenCalled();
  });

  it("fails with not_enrolled (not lesson_locked) when the actor is neither enrolled nor would pass the lock-chain", async () => {
    isEnrolled.mockResolvedValue(false);
    isLessonAccessible.mockResolvedValue(false);

    const { markVideoWatched } = await import("./service");
    const result = await markVideoWatched({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.not_enrolled", message: expect.any(String) },
    });
  });

  it("fails when watchVideoEnabled is not set on the lesson", async () => {
    findLessonRequirements.mockResolvedValue({ readTextEnabled: false, watchVideoEnabled: false, quizEnabled: false });

    const { markVideoWatched } = await import("./service");
    const result = await markVideoWatched({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.progress.requirement_not_enabled", message: expect.any(String) },
    });
    expect(insertVideoCompletionIfMissing).not.toHaveBeenCalled();
  });

  it("fails when the lesson is locked", async () => {
    isLessonAccessible.mockResolvedValue(false);

    const { markVideoWatched } = await import("./service");
    const result = await markVideoWatched({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.progress.lesson_locked", message: expect.any(String) } });
  });

  it("is idempotent — marking twice succeeds both times without duplicating", async () => {
    findLessonRequirements.mockResolvedValue({ readTextEnabled: false, watchVideoEnabled: true, quizEnabled: false });

    const { markVideoWatched } = await import("./service");
    const first = await markVideoWatched({ lessonId: "lesson-1", actorId: "actor-1" });
    const second = await markVideoWatched({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(first).toEqual({ success: true, data: { lessonId: "lesson-1", completed: true } });
    expect(second).toEqual({ success: true, data: { lessonId: "lesson-1", completed: true } });
    expect(insertVideoCompletionIfMissing).toHaveBeenCalledTimes(2);
  });
});
