import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findSectionsByLesson = vi.fn();
const reorderSections = vi.fn();

vi.mock("./store", () => ({
  findSectionsByLesson: (...args: unknown[]) => findSectionsByLesson(...args),
  reorderSections: (...args: unknown[]) => reorderSections(...args),
}));

function section(id: string, position: number) {
  return {
    id,
    lessonId: "lesson-1",
    position,
    title: `Seção ${position}`,
    cmsEntryId: `entry-${id}`,
    videoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("reorderLessonSectionsService", () => {
  beforeEach(() => {
    findSectionsByLesson.mockReset();
    reorderSections.mockReset();
  });

  it("fails when the provided sectionIds do not match the lesson's sections exactly", async () => {
    findSectionsByLesson.mockResolvedValue([section("section-1", 1), section("section-2", 2)]);

    const { reorderLessonSectionsService } = await import("./service");
    const result = await reorderLessonSectionsService({
      lessonId: "lesson-1",
      sectionIds: ["section-1", "section-3"],
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_sections.reorder_mismatch", message: expect.any(String) },
    });
    expect(reorderSections).not.toHaveBeenCalled();
  });

  it("fails when the provided sectionIds contain duplicates", async () => {
    findSectionsByLesson.mockResolvedValue([section("section-1", 1), section("section-2", 2)]);

    const { reorderLessonSectionsService } = await import("./service");
    const result = await reorderLessonSectionsService({
      lessonId: "lesson-1",
      sectionIds: ["section-1", "section-1"],
      actorId: "actor-1",
    });

    expect(result.success).toBe(false);
    expect(reorderSections).not.toHaveBeenCalled();
  });

  it("reorders the sections when the set of ids matches exactly", async () => {
    findSectionsByLesson.mockResolvedValue([section("section-1", 1), section("section-2", 2)]);
    reorderSections.mockResolvedValue([section("section-2", 1), section("section-1", 2)]);

    const { reorderLessonSectionsService } = await import("./service");
    const result = await reorderLessonSectionsService({
      lessonId: "lesson-1",
      sectionIds: ["section-2", "section-1"],
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(reorderSections).toHaveBeenCalledWith("lesson-1", ["section-2", "section-1"]);
  });
});
