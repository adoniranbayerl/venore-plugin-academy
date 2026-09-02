import { beforeEach, describe, expect, it, vi } from "vitest";

// Teste de acordo: garante que a fronteira de autorização (isLessonAccessible) e a tela
// (getCourseProgress) nunca divirjam, já que agora compartilham a mesma função pura
// (lesson-chain.ts) e o mesmo carregador em lote (lesson-chain-store.ts). Só o nível mais baixo
// que toca banco é mockado — todo o resto (loadLessonChain, computeLessonChain, os dois
// services) roda de verdade.

const loadLessonChainRawData = vi.fn();

vi.mock("./lesson-chain-store", () => ({
  loadLessonChainRawData: (...args: unknown[]) => loadLessonChainRawData(...args),
}));

const findCourseCompletion = vi.fn().mockResolvedValue(null);

vi.mock("./course-completion-store", () => ({
  findCourseCompletion: (...args: unknown[]) => findCourseCompletion(...args),
}));

const isEnrolled = vi.fn();

vi.mock("./enrollment", () => ({
  isEnrolled: (...args: unknown[]) => isEnrolled(...args),
}));

const findCourseById = vi.fn();

vi.mock("../features/progress/get-course-progress/store", () => ({
  findCourseById: (...args: unknown[]) => findCourseById(...args),
}));

const course = { id: "course-1", title: "Course", description: null, createdBy: "prof-1", createdAt: new Date(), updatedAt: new Date() };

function lesson(id: string, position: number) {
  return {
    id,
    courseId: "course-1",
    title: `Aula ${position}`,
    body: null,
    videoUrl: null,
    coverMediaId: null,
    position,
    status: "restricted" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

const lesson1 = lesson("lesson-1", 1);
const lesson2 = lesson("lesson-2", 2);
const lesson3 = lesson("lesson-3", 3);
const lesson4 = lesson("lesson-4", 4);

describe("isLessonAccessible vs getCourseProgress agreement", () => {
  beforeEach(() => {
    loadLessonChainRawData.mockReset();
    isEnrolled.mockReset();
    findCourseById.mockReset();

    isEnrolled.mockResolvedValue(true);
    findCourseById.mockResolvedValue(course);
  });

  it("agrees on locked/accessible for every lesson, including the transitivity case", async () => {
    // lesson-1: readText exigido, não lido -> incompleta.
    // lesson-2: sem requirements -> trivialmente completa, mas bloqueada (lesson-1 incompleta).
    // lesson-3: quiz exigido, sem tentativa aprovada -> incompleta, e transitivamente bloqueada.
    // lesson-4: sem requirements -> trivialmente completa, transitivamente bloqueada.
    loadLessonChainRawData.mockResolvedValue({
      lessons: [lesson1, lesson2, lesson3, lesson4],
      requirementsByLessonId: new Map([
        ["lesson-1", { lessonId: "lesson-1", readTextEnabled: true, watchVideoEnabled: false, quizEnabled: false, quizPassThresholdPercent: null, quizMaxAttempts: null, updatedAt: new Date() }],
        ["lesson-2", null],
        ["lesson-3", { lessonId: "lesson-3", readTextEnabled: false, watchVideoEnabled: false, quizEnabled: true, quizPassThresholdPercent: 70, quizMaxAttempts: 3, updatedAt: new Date() }],
        ["lesson-4", null],
      ]),
      textCompletedLessonIds: new Set(),
      videoCompletedLessonIds: new Set(),
      attemptsByLessonId: new Map(),
      activityIdsByLessonId: new Map(),
      submittedActivityIds: new Set(),
    });

    const { isLessonAccessible } = await import("./lesson-progress");
    const { getCourseProgress } = await import("../features/progress/get-course-progress/service");

    const progress = await getCourseProgress({ courseId: "course-1", actorId: "actor-1" });
    expect(progress.success).toBe(true);
    if (!progress.success) return;

    const lockedByLessonId = new Map(progress.data.lessons.map((l) => [l.lessonId, l.locked]));
    expect(lockedByLessonId.get("lesson-1")).toBe(false);
    expect(lockedByLessonId.get("lesson-2")).toBe(true);
    expect(lockedByLessonId.get("lesson-3")).toBe(true);
    expect(lockedByLessonId.get("lesson-4")).toBe(true);

    for (const lesson of [lesson1, lesson2, lesson3, lesson4]) {
      const accessible = await isLessonAccessible(lesson, "actor-1");
      const locked = lockedByLessonId.get(lesson.id);
      expect(accessible).toBe(!locked);
    }
  });

  it("agrees once the whole chain is completed", async () => {
    loadLessonChainRawData.mockResolvedValue({
      lessons: [lesson1, lesson2, lesson3],
      requirementsByLessonId: new Map([
        ["lesson-1", null],
        ["lesson-2", null],
        ["lesson-3", null],
      ]),
      textCompletedLessonIds: new Set(),
      videoCompletedLessonIds: new Set(),
      attemptsByLessonId: new Map(),
      activityIdsByLessonId: new Map(),
      submittedActivityIds: new Set(),
    });

    const { isLessonAccessible } = await import("./lesson-progress");
    const { getCourseProgress } = await import("../features/progress/get-course-progress/service");

    const progress = await getCourseProgress({ courseId: "course-1", actorId: "actor-1" });
    expect(progress.success).toBe(true);
    if (!progress.success) return;

    const lockedByLessonId = new Map(progress.data.lessons.map((l) => [l.lessonId, l.locked]));

    for (const lesson of [lesson1, lesson2, lesson3]) {
      const accessible = await isLessonAccessible(lesson, "actor-1");
      expect(accessible).toBe(!lockedByLessonId.get(lesson.id));
      expect(accessible).toBe(true);
    }
  });
});
