import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const isEnrolled = vi.fn();
vi.mock("../../../shared/enrollment", () => ({
  isEnrolled: (...args: unknown[]) => isEnrolled(...args),
}));

vi.mock("../../../shared/progress-hooks", () => ({ onProgressAdvanced: vi.fn() }));

const findCompletedSectionIds = vi.fn();
const findLessonRequirements = vi.fn();
const insertSectionCompletionIfMissing = vi.fn();
const isLessonAccessible = vi.fn();
vi.mock("../../../shared/lesson-progress", () => ({
  findCompletedSectionIds: (...args: unknown[]) => findCompletedSectionIds(...args),
  findLessonRequirements: (...args: unknown[]) => findLessonRequirements(...args),
  insertSectionCompletionIfMissing: (...args: unknown[]) => insertSectionCompletionIfMissing(...args),
  isLessonAccessible: (...args: unknown[]) => isLessonAccessible(...args),
}));

const markTextRead = vi.fn();
vi.mock("../mark-text-read/service", () => ({
  markTextRead: (...args: unknown[]) => markTextRead(...args),
}));

const findLessonById = vi.fn();
const findSectionById = vi.fn();
const findSectionIdsByLesson = vi.fn();
vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  findSectionById: (...args: unknown[]) => findSectionById(...args),
  findSectionIdsByLesson: (...args: unknown[]) => findSectionIdsByLesson(...args),
}));

const section = { id: "section-1", lessonId: "lesson-1", position: 1, title: "Introdução", cmsEntryId: "entry-1", videoUrl: null, createdAt: new Date(), updatedAt: new Date() };
const lesson = { id: "lesson-1", courseId: "course-1", position: 1 };

describe("markLessonSectionRead", () => {
  beforeEach(() => {
    isEnrolled.mockReset();
    findCompletedSectionIds.mockReset();
    findLessonRequirements.mockReset();
    insertSectionCompletionIfMissing.mockReset();
    isLessonAccessible.mockReset();
    markTextRead.mockReset();
    findLessonById.mockReset();
    findSectionById.mockReset();
    findSectionIdsByLesson.mockReset();

    findSectionById.mockResolvedValue(section);
    findLessonById.mockResolvedValue(lesson);
    isEnrolled.mockResolvedValue(true);
    isLessonAccessible.mockResolvedValue(true);
    findLessonRequirements.mockResolvedValue({ readTextEnabled: false });
  });

  it("fails when the section does not exist", async () => {
    findSectionById.mockResolvedValue(null);

    const { markLessonSectionRead } = await import("./service");
    const result = await markLessonSectionRead({ sectionId: "missing", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.lesson_sections.not_found", message: expect.any(String) } });
    expect(insertSectionCompletionIfMissing).not.toHaveBeenCalled();
  });

  it("fails when the actor is not enrolled", async () => {
    isEnrolled.mockResolvedValue(false);

    const { markLessonSectionRead } = await import("./service");
    const result = await markLessonSectionRead({ sectionId: "section-1", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.enrollments.not_enrolled", message: expect.any(String) } });
    expect(insertSectionCompletionIfMissing).not.toHaveBeenCalled();
  });

  it("marks the section as read without cascading when readTextEnabled is off", async () => {
    const { markLessonSectionRead } = await import("./service");
    const result = await markLessonSectionRead({ sectionId: "section-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { sectionId: "section-1", completed: true } });
    expect(insertSectionCompletionIfMissing).toHaveBeenCalledWith("section-1", "actor-1");
    expect(markTextRead).not.toHaveBeenCalled();
  });

  it("cascades to markTextRead when readTextEnabled is on and every section is now complete", async () => {
    findLessonRequirements.mockResolvedValue({ readTextEnabled: true });
    findSectionIdsByLesson.mockResolvedValue(["section-1", "section-2"]);
    findCompletedSectionIds.mockResolvedValue(new Set(["section-1", "section-2"]));

    const { markLessonSectionRead } = await import("./service");
    await markLessonSectionRead({ sectionId: "section-1", actorId: "actor-1" });

    expect(markTextRead).toHaveBeenCalledWith({ lessonId: "lesson-1", actorId: "actor-1" });
  });

  it("does not cascade when readTextEnabled is on but another section is still pending", async () => {
    findLessonRequirements.mockResolvedValue({ readTextEnabled: true });
    findSectionIdsByLesson.mockResolvedValue(["section-1", "section-2"]);
    findCompletedSectionIds.mockResolvedValue(new Set(["section-1"]));

    const { markLessonSectionRead } = await import("./service");
    await markLessonSectionRead({ sectionId: "section-1", actorId: "actor-1" });

    expect(markTextRead).not.toHaveBeenCalled();
  });
});
