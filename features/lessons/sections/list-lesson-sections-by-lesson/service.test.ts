import { beforeEach, describe, expect, it, vi } from "vitest";

const findSectionsByLesson = vi.fn();

vi.mock("./store", () => ({
  findSectionsByLesson: (...args: unknown[]) => findSectionsByLesson(...args),
}));

describe("listLessonSectionsByLesson", () => {
  beforeEach(() => {
    findSectionsByLesson.mockReset();
  });

  it("returns the sections of the given lesson ordered by position", async () => {
    const sections = [
      {
        id: "section-1",
        lessonId: "lesson-1",
        position: 1,
        title: "Intro",
        cmsEntryId: "entry-1",
        videoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    findSectionsByLesson.mockResolvedValue(sections);

    const { listLessonSectionsByLesson } = await import("./service");
    const result = await listLessonSectionsByLesson({ lessonId: "lesson-1" });

    expect(result).toEqual({ success: true, data: sections });
    expect(findSectionsByLesson).toHaveBeenCalledWith("lesson-1");
  });
});
