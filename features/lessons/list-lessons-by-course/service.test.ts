import { beforeEach, describe, expect, it, vi } from "vitest";

const findLessonsByCourse = vi.fn();

vi.mock("./store", () => ({
  findLessonsByCourse: (...args: unknown[]) => findLessonsByCourse(...args),
}));

describe("listLessonsByCourse", () => {
  beforeEach(() => {
    findLessonsByCourse.mockReset();
  });

  it("returns the lessons of the course ordered by position", async () => {
    const lessons = [
      { id: "lesson-1", courseId: "course-1", cmsEntryId: "entry-1", videoUrl: null, position: 1, createdAt: new Date(), updatedAt: new Date() },
    ];
    findLessonsByCourse.mockResolvedValue(lessons);

    const { listLessonsByCourse } = await import("./service");
    const result = await listLessonsByCourse({ courseId: "course-1" });

    expect(result).toEqual({ success: true, data: lessons });
    expect(findLessonsByCourse).toHaveBeenCalledWith("course-1");
  });
});
