import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const getUserContext = vi.fn();

vi.mock("@venore/plugin-sdk/rbac", () => ({
  getUserContext: (...args: unknown[]) => getUserContext(...args),
}));

const invalidateAttempts = vi.fn();

vi.mock("../../../shared/quiz-attempts", () => ({
  invalidateAttempts: (...args: unknown[]) => invalidateAttempts(...args),
}));

const findLessonById = vi.fn();
const findCourseById = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  findCourseById: (...args: unknown[]) => findCourseById(...args),
}));

const lesson = { id: "lesson-1", courseId: "course-1", position: 1 };
const course = { id: "course-1", createdBy: "prof-1" };

describe("resetQuizAttempts", () => {
  beforeEach(() => {
    getUserContext.mockReset();
    invalidateAttempts.mockReset();
    findLessonById.mockReset();
    findCourseById.mockReset();

    findLessonById.mockResolvedValue(lesson);
    findCourseById.mockResolvedValue(course);
    invalidateAttempts.mockResolvedValue(2);
  });

  it("fails when the lesson does not exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { resetQuizAttempts } = await import("./service");
    const result = await resetQuizAttempts({ lessonId: "missing", studentActorId: "student-1", actorId: "prof-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.lessons.not_found", message: expect.any(String) } });
    expect(invalidateAttempts).not.toHaveBeenCalled();
  });

  it("refuses when the actor is neither the course creator nor a superadmin", async () => {
    getUserContext.mockResolvedValue({ success: true, data: { isSuperadmin: false } });

    const { resetQuizAttempts } = await import("./service");
    const result = await resetQuizAttempts({ lessonId: "lesson-1", studentActorId: "student-1", actorId: "someone-else" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.reset_quiz_attempts.forbidden", message: expect.any(String) },
    });
    expect(invalidateAttempts).not.toHaveBeenCalled();
  });

  it("allows the course creator to reset", async () => {
    getUserContext.mockResolvedValue({ success: true, data: { isSuperadmin: false } });

    const { resetQuizAttempts } = await import("./service");
    const result = await resetQuizAttempts({ lessonId: "lesson-1", studentActorId: "student-1", actorId: "prof-1" });

    expect(result).toEqual({ success: true, data: { invalidatedCount: 2 } });
    expect(invalidateAttempts).toHaveBeenCalledWith("lesson-1", "student-1");
  });

  it("allows a superadmin to reset even when they are not the course creator", async () => {
    getUserContext.mockResolvedValue({ success: true, data: { isSuperadmin: true } });

    const { resetQuizAttempts } = await import("./service");
    const result = await resetQuizAttempts({ lessonId: "lesson-1", studentActorId: "student-1", actorId: "someone-else" });

    expect(result).toEqual({ success: true, data: { invalidatedCount: 2 } });
  });
});
