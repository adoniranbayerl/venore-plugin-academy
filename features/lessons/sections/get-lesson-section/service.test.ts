import { beforeEach, describe, expect, it, vi } from "vitest";

const findSectionById = vi.fn();

vi.mock("./store", () => ({
  findSectionById: (...args: unknown[]) => findSectionById(...args),
}));

describe("getLessonSection", () => {
  beforeEach(() => {
    findSectionById.mockReset();
  });

  it("returns null when the section does not exist", async () => {
    findSectionById.mockResolvedValue(null);

    const { getLessonSection } = await import("./service");
    const result = await getLessonSection({ id: "missing" });

    expect(result).toEqual({ success: true, data: null });
  });

  it("returns the section when it exists", async () => {
    const section = {
      id: "section-1",
      lessonId: "lesson-1",
      position: 1,
      title: "Intro",
      cmsEntryId: "entry-1",
      videoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    findSectionById.mockResolvedValue(section);

    const { getLessonSection } = await import("./service");
    const result = await getLessonSection({ id: "section-1" });

    expect(result).toEqual({ success: true, data: section });
  });
});
