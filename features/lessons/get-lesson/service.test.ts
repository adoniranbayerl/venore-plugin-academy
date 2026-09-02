import { beforeEach, describe, expect, it, vi } from "vitest";

const findLessonById = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
}));

describe("getLesson", () => {
  beforeEach(() => {
    findLessonById.mockReset();
  });

  it("returns the lesson when it exists", async () => {
    const lesson = { id: "lesson-1", courseId: "course-1", cmsEntryId: "entry-1", videoUrl: null, position: 1, createdAt: new Date(), updatedAt: new Date() };
    findLessonById.mockResolvedValue(lesson);

    const { getLesson } = await import("./service");
    const result = await getLesson({ id: "lesson-1" });

    expect(result).toEqual({ success: true, data: lesson });
  });

  it("returns null data when the lesson doesn't exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { getLesson } = await import("./service");
    const result = await getLesson({ id: "missing" });

    expect(result).toEqual({ success: true, data: null });
  });
});
