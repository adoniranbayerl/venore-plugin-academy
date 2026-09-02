import { beforeEach, describe, expect, it, vi } from "vitest";

const isEnrolled = vi.fn();
vi.mock("../../../shared/enrollment", () => ({
  isEnrolled: (...args: unknown[]) => isEnrolled(...args),
}));

const findLessonRequirements = vi.fn();
const isLessonAccessible = vi.fn();
vi.mock("../../../shared/lesson-progress", () => ({
  findLessonRequirements: (...args: unknown[]) => findLessonRequirements(...args),
  isLessonAccessible: (...args: unknown[]) => isLessonAccessible(...args),
}));

const findLessonById = vi.fn();
const findLessonActivitiesByLesson = vi.fn();
const findSubmissionsByActorForActivities = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  findLessonActivitiesByLesson: (...args: unknown[]) => findLessonActivitiesByLesson(...args),
  findSubmissionsByActorForActivities: (...args: unknown[]) => findSubmissionsByActorForActivities(...args),
}));

describe("listLessonActivitiesForStudent", () => {
  beforeEach(() => {
    isEnrolled.mockReset();
    findLessonRequirements.mockReset();
    isLessonAccessible.mockReset();
    findLessonById.mockReset();
    findLessonActivitiesByLesson.mockReset();
    findSubmissionsByActorForActivities.mockReset();
  });

  it("fails when the lesson does not exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { listLessonActivitiesForStudent } = await import("./service");
    const result = await listLessonActivitiesForStudent({ lessonId: "missing", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.lessons.not_found", message: expect.any(String) } });
  });

  it("fails when the actor is not enrolled", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1", courseId: "course-1" });
    isEnrolled.mockResolvedValue(false);

    const { listLessonActivitiesForStudent } = await import("./service");
    const result = await listLessonActivitiesForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.not_enrolled", message: expect.any(String) },
    });
  });

  it("fails when the lesson is locked", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1", courseId: "course-1" });
    isEnrolled.mockResolvedValue(true);
    isLessonAccessible.mockResolvedValue(false);

    const { listLessonActivitiesForStudent } = await import("./service");
    const result = await listLessonActivitiesForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.progress.lesson_locked", message: expect.any(String) },
    });
  });

  it("fails when the activity requirement is not enabled", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1", courseId: "course-1" });
    isEnrolled.mockResolvedValue(true);
    isLessonAccessible.mockResolvedValue(true);
    findLessonRequirements.mockResolvedValue({ activityEnabled: false });

    const { listLessonActivitiesForStudent } = await import("./service");
    const result = await listLessonActivitiesForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_activities.not_enabled", message: expect.any(String) },
    });
  });

  it("returns the activities annotated with the actor's own submission, when everything checks out", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1", courseId: "course-1" });
    isEnrolled.mockResolvedValue(true);
    isLessonAccessible.mockResolvedValue(true);
    findLessonRequirements.mockResolvedValue({ activityEnabled: true });
    findLessonActivitiesByLesson.mockResolvedValue([{ id: "activity-1" }, { id: "activity-2" }]);
    findSubmissionsByActorForActivities.mockResolvedValue([
      { id: "submission-1", activityId: "activity-1", actorId: "actor-1", reviewStatus: "pending" },
    ]);

    const { listLessonActivitiesForStudent } = await import("./service");
    const result = await listLessonActivitiesForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: true,
      data: [
        { id: "activity-1", submission: { id: "submission-1", activityId: "activity-1", actorId: "actor-1", reviewStatus: "pending" } },
        { id: "activity-2", submission: null },
      ],
    });
  });
});
