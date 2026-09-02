import { beforeEach, describe, expect, it, vi } from "vitest";

const findLessonMaterialsByLesson = vi.fn();

vi.mock("./store", () => ({
  findLessonMaterialsByLesson: (...args: unknown[]) => findLessonMaterialsByLesson(...args),
}));

describe("listLessonMaterialsByLesson", () => {
  beforeEach(() => {
    findLessonMaterialsByLesson.mockReset();
  });

  it("returns the lesson materials ordered by position", async () => {
    const materials = [
      { id: "material-1", lessonId: "lesson-1", mediaId: "media-1", label: "Slides", position: 1, createdAt: new Date() },
    ];
    findLessonMaterialsByLesson.mockResolvedValue(materials);

    const { listLessonMaterialsByLesson } = await import("./service");
    const result = await listLessonMaterialsByLesson({ lessonId: "lesson-1" });

    expect(result).toEqual({ success: true, data: materials });
  });
});
