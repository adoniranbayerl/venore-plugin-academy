import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findSectionById = vi.fn();
const deleteSectionAndRenumber = vi.fn();

vi.mock("./store", () => ({
  findSectionById: (...args: unknown[]) => findSectionById(...args),
  deleteSectionAndRenumber: (...args: unknown[]) => deleteSectionAndRenumber(...args),
}));

const existingSection = {
  id: "section-1",
  lessonId: "lesson-1",
  position: 2,
  title: "Intro",
  cmsEntryId: "entry-1",
  videoUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("deleteLessonSectionService", () => {
  beforeEach(() => {
    findSectionById.mockReset();
    deleteSectionAndRenumber.mockReset();
  });

  it("fails when the section does not exist", async () => {
    findSectionById.mockResolvedValue(null);

    const { deleteLessonSectionService } = await import("./service");
    const result = await deleteLessonSectionService({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_sections.not_found", message: expect.any(String) },
    });
    expect(deleteSectionAndRenumber).not.toHaveBeenCalled();
  });

  it("deletes the section and renumbers the following sections", async () => {
    findSectionById.mockResolvedValue(existingSection);
    deleteSectionAndRenumber.mockResolvedValue(undefined);

    const { deleteLessonSectionService } = await import("./service");
    const result = await deleteLessonSectionService({ id: "section-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "section-1" } });
    expect(deleteSectionAndRenumber).toHaveBeenCalledWith("lesson-1", 2, "section-1");
  });
});
