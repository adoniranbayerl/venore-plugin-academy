import { beforeEach, describe, expect, it, vi } from "vitest";

const loadLessonChainRawData = vi.fn();

vi.mock("./lesson-chain-store", () => ({
  loadLessonChainRawData: (...args: unknown[]) => loadLessonChainRawData(...args),
}));

const findCourseCompletion = vi.fn().mockResolvedValue(null);

vi.mock("./course-completion-store", () => ({
  findCourseCompletion: (...args: unknown[]) => findCourseCompletion(...args),
}));

const lesson1 = {
  id: "lesson-1",
  courseId: "course-1",
  title: "Aula 1",
  body: null,
  videoUrl: null,
  coverMediaId: null,
  position: 1,
  status: "restricted" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const lesson2 = {
  id: "lesson-2",
  courseId: "course-1",
  title: "Aula 2",
  body: null,
  videoUrl: null,
  coverMediaId: null,
  position: 2,
  status: "restricted" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("loadLessonChain", () => {
  beforeEach(() => {
    loadLessonChainRawData.mockReset();
    findCourseCompletion.mockReset().mockResolvedValue(null);
  });

  it("destrava todas as aulas e marca trailFreed quando existe o marco de trilha concluída", async () => {
    findCourseCompletion.mockResolvedValue({ completedAt: new Date() });
    loadLessonChainRawData.mockResolvedValue({
      lessons: [lesson1, lesson2],
      // aula 1 incompleta (readText exigido, não lido) — mesmo assim deve ficar destravada
      requirementsByLessonId: new Map([
        ["lesson-1", { lessonId: "lesson-1", readTextEnabled: true, watchVideoEnabled: false, quizEnabled: false, quizPassThresholdPercent: null, quizMaxAttempts: null, updatedAt: new Date() }],
        ["lesson-2", null],
      ]),
      textCompletedLessonIds: new Set(),
      videoCompletedLessonIds: new Set(),
      attemptsByLessonId: new Map(),
      activityIdsByLessonId: new Map(),
      submittedActivityIds: new Set(),
    });

    const { loadLessonChain } = await import("./lesson-progress");
    const result = await loadLessonChain("course-1", "actor-1");

    expect(result.trailFreed).toBe(true);
    expect(result.chain).toEqual([
      { lessonId: "lesson-1", completed: true, locked: false },
      { lessonId: "lesson-2", completed: true, locked: false },
    ]);
  });

  it("maps requirements, completions and passing attempts into the chain facts", async () => {
    loadLessonChainRawData.mockResolvedValue({
      lessons: [lesson1, lesson2],
      requirementsByLessonId: new Map([
        ["lesson-1", { lessonId: "lesson-1", readTextEnabled: true, watchVideoEnabled: false, quizEnabled: false, quizPassThresholdPercent: null, quizMaxAttempts: null, updatedAt: new Date() }],
        ["lesson-2", null],
      ]),
      textCompletedLessonIds: new Set(["lesson-1"]),
      videoCompletedLessonIds: new Set(),
      attemptsByLessonId: new Map(),
      activityIdsByLessonId: new Map(),
      submittedActivityIds: new Set(),
    });

    const { loadLessonChain } = await import("./lesson-progress");
    const { chain } = await loadLessonChain("course-1", "actor-1");

    expect(chain).toEqual([
      { lessonId: "lesson-1", completed: true, locked: false },
      { lessonId: "lesson-2", completed: true, locked: false },
    ]);
  });

  it("treats a lesson as quiz-passed only when some active attempt has passed", async () => {
    loadLessonChainRawData.mockResolvedValue({
      lessons: [lesson1],
      requirementsByLessonId: new Map([
        ["lesson-1", { lessonId: "lesson-1", readTextEnabled: false, watchVideoEnabled: false, quizEnabled: true, quizPassThresholdPercent: 70, quizMaxAttempts: 3, updatedAt: new Date() }],
      ]),
      textCompletedLessonIds: new Set(),
      videoCompletedLessonIds: new Set(),
      attemptsByLessonId: new Map([
        ["lesson-1", [{ id: "a1", lessonId: "lesson-1", actorId: "actor-1", attemptNumber: 1, score: 40, passed: false, answers: [], createdAt: new Date(), invalidatedAt: null }]],
      ]),
      activityIdsByLessonId: new Map(),
      submittedActivityIds: new Set(),
    });

    const { loadLessonChain } = await import("./lesson-progress");
    const { chain } = await loadLessonChain("course-1", "actor-1");

    expect(chain[0].completed).toBe(false);
  });
});

describe("isLessonAccessible", () => {
  beforeEach(() => {
    loadLessonChainRawData.mockReset();
    findCourseCompletion.mockReset().mockResolvedValue(null);
  });

  it("is accessible when the chain reports the lesson as not locked", async () => {
    loadLessonChainRawData.mockResolvedValue({
      lessons: [lesson1, lesson2],
      requirementsByLessonId: new Map([["lesson-1", null], ["lesson-2", null]]),
      textCompletedLessonIds: new Set(),
      videoCompletedLessonIds: new Set(),
      attemptsByLessonId: new Map(),
      activityIdsByLessonId: new Map(),
      submittedActivityIds: new Set(),
    });

    const { isLessonAccessible } = await import("./lesson-progress");
    expect(await isLessonAccessible(lesson2, "actor-1")).toBe(true);
  });

  it("is blocked when the chain reports the lesson as locked", async () => {
    loadLessonChainRawData.mockResolvedValue({
      lessons: [lesson1, lesson2],
      requirementsByLessonId: new Map([
        ["lesson-1", { lessonId: "lesson-1", readTextEnabled: true, watchVideoEnabled: false, quizEnabled: false, quizPassThresholdPercent: null, quizMaxAttempts: null, updatedAt: new Date() }],
        ["lesson-2", null],
      ]),
      textCompletedLessonIds: new Set(),
      videoCompletedLessonIds: new Set(),
      attemptsByLessonId: new Map(),
      activityIdsByLessonId: new Map(),
      submittedActivityIds: new Set(),
    });

    const { isLessonAccessible } = await import("./lesson-progress");
    expect(await isLessonAccessible(lesson2, "actor-1")).toBe(false);
  });

  it("denies access (safe default) when the lesson is missing from its own course's chain", async () => {
    loadLessonChainRawData.mockResolvedValue({
      lessons: [],
      requirementsByLessonId: new Map(),
      textCompletedLessonIds: new Set(),
      videoCompletedLessonIds: new Set(),
      attemptsByLessonId: new Map(),
      activityIdsByLessonId: new Map(),
      submittedActivityIds: new Set(),
    });

    const { isLessonAccessible } = await import("./lesson-progress");
    expect(await isLessonAccessible(lesson1, "actor-1")).toBe(false);
  });
});
