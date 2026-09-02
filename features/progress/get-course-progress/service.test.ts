import { beforeEach, describe, expect, it, vi } from "vitest";

const loadLessonChain = vi.fn();

vi.mock("../../../shared/lesson-progress", () => ({
  loadLessonChain: (...args: unknown[]) => loadLessonChain(...args),
}));

const isEnrolled = vi.fn();

vi.mock("../../../shared/enrollment", () => ({
  isEnrolled: (...args: unknown[]) => isEnrolled(...args),
}));

const findCourseById = vi.fn();

vi.mock("./store", () => ({
  findCourseById: (...args: unknown[]) => findCourseById(...args),
}));

const course = { id: "course-1", title: "Course", description: null, createdBy: "prof-1", createdAt: new Date(), updatedAt: new Date() };
const lesson1 = { id: "lesson-1", courseId: "course-1", cmsEntryId: "entry-1", videoUrl: null, position: 1, createdAt: new Date(), updatedAt: new Date() };
const lesson2 = { id: "lesson-2", courseId: "course-1", cmsEntryId: "entry-2", videoUrl: null, position: 2, createdAt: new Date(), updatedAt: new Date() };
const lesson3 = { id: "lesson-3", courseId: "course-1", cmsEntryId: "entry-3", videoUrl: null, position: 3, createdAt: new Date(), updatedAt: new Date() };

function emptyChainDeps() {
  return {
    requirementsByLessonId: new Map(),
    textCompletedLessonIds: new Set(),
    videoCompletedLessonIds: new Set(),
    attemptsByLessonId: new Map(),
    activityIdsByLessonId: new Map(),
    submittedActivityIds: new Set(),
  };
}

describe("getCourseProgress", () => {
  beforeEach(() => {
    findCourseById.mockReset();
    isEnrolled.mockReset();
    loadLessonChain.mockReset();

    findCourseById.mockResolvedValue(course);
    isEnrolled.mockResolvedValue(true);
  });

  it("fails when the course does not exist", async () => {
    findCourseById.mockResolvedValue(null);

    const { getCourseProgress } = await import("./service");
    const result = await getCourseProgress({ courseId: "missing", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.courses.not_found", message: expect.any(String) } });
  });

  it("fails when the actor is not enrolled in the course", async () => {
    isEnrolled.mockResolvedValue(false);

    const { getCourseProgress } = await import("./service");
    const result = await getCourseProgress({ courseId: "course-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.not_enrolled", message: expect.any(String) },
    });
    expect(loadLessonChain).not.toHaveBeenCalled();
  });

  it("marks the first lesson unlocked and locks the second when the first is incomplete", async () => {
    loadLessonChain.mockResolvedValue({
      lessons: [lesson1, lesson2],
      ...emptyChainDeps(),
      chain: [
        { lessonId: "lesson-1", completed: false, locked: false },
        { lessonId: "lesson-2", completed: true, locked: true },
      ],
    });

    const { getCourseProgress } = await import("./service");
    const result = await getCourseProgress({ courseId: "course-1", actorId: "actor-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.lessons[0]).toMatchObject({ lessonId: "lesson-1", locked: false, completed: false });
    expect(result.data.lessons[1]).toMatchObject({ lessonId: "lesson-2", locked: true, completed: true });
    expect(result.data.completedLessons).toBe(1);
    expect(result.data.courseCompleted).toBe(false);
  });

  it("unlocks the second lesson once the first is complete", async () => {
    loadLessonChain.mockResolvedValue({
      lessons: [lesson1, lesson2],
      ...emptyChainDeps(),
      chain: [
        { lessonId: "lesson-1", completed: true, locked: false },
        { lessonId: "lesson-2", completed: true, locked: false },
      ],
    });

    const { getCourseProgress } = await import("./service");
    const result = await getCourseProgress({ courseId: "course-1", actorId: "actor-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.lessons[1]).toMatchObject({ locked: false, completed: true });
    expect(result.data.courseCompleted).toBe(true);
  });

  it("keeps the third lesson locked when the chain is broken by an incomplete first lesson, even if the second is trivially complete", async () => {
    loadLessonChain.mockResolvedValue({
      lessons: [lesson1, lesson2, lesson3],
      ...emptyChainDeps(),
      chain: [
        { lessonId: "lesson-1", completed: false, locked: false },
        { lessonId: "lesson-2", completed: true, locked: true },
        { lessonId: "lesson-3", completed: false, locked: true },
      ],
    });

    const { getCourseProgress } = await import("./service");
    const result = await getCourseProgress({ courseId: "course-1", actorId: "actor-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.lessons[0]).toMatchObject({ lessonId: "lesson-1", locked: false, completed: false });
    expect(result.data.lessons[1]).toMatchObject({ lessonId: "lesson-2", locked: true, completed: true });
    expect(result.data.lessons[2]).toMatchObject({ lessonId: "lesson-3", locked: true });
  });

  it("uses the loaded requirements, completions and attempts to build each lesson view", async () => {
    loadLessonChain.mockResolvedValue({
      lessons: [lesson1],
      requirementsByLessonId: new Map([
        [
          "lesson-1",
          {
            lessonId: "lesson-1",
            readTextEnabled: true,
            watchVideoEnabled: false,
            quizEnabled: true,
            quizPassThresholdPercent: 70,
            quizMaxAttempts: 3,
            activityEnabled: true,
            updatedAt: new Date(),
          },
        ],
      ]),
      textCompletedLessonIds: new Set(["lesson-1"]),
      videoCompletedLessonIds: new Set(),
      attemptsByLessonId: new Map([
        ["lesson-1", [{ id: "a1", lessonId: "lesson-1", actorId: "actor-1", attemptNumber: 1, score: 80, passed: true, answers: [], createdAt: new Date(), invalidatedAt: null }]],
      ]),
      activityIdsByLessonId: new Map([["lesson-1", ["activity-1", "activity-2"]]]),
      submittedActivityIds: new Set(["activity-1"]),
      chain: [{ lessonId: "lesson-1", completed: true, locked: false }],
    });

    const { getCourseProgress } = await import("./service");
    const result = await getCourseProgress({ courseId: "course-1", actorId: "actor-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.lessons[0].requirements).toMatchObject({
      readTextEnabled: true,
      textRead: true,
      quizEnabled: true,
      quizPassed: true,
      quizAttemptsUsed: 1,
      quizBestScore: 80,
      quizBestGrade: 8,
      activityEnabled: true,
      activitiesTotal: 2,
      activitiesSubmittedCount: 1,
      activitiesSubmitted: false,
    });
  });
});
