import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const getEntry = vi.fn();

vi.mock("@venore/plugin-sdk/cms", () => ({
  getEntry: (...args: unknown[]) => getEntry(...args),
}));

const findSectionById = vi.fn();
const findSectionByCmsEntryId = vi.fn();
const updateSection = vi.fn();

vi.mock("./store", () => ({
  findSectionById: (...args: unknown[]) => findSectionById(...args),
  findSectionByCmsEntryId: (...args: unknown[]) => findSectionByCmsEntryId(...args),
  updateSection: (...args: unknown[]) => updateSection(...args),
}));

const existingSection = {
  id: "section-1",
  lessonId: "lesson-1",
  position: 1,
  title: "Intro",
  cmsEntryId: "entry-1",
  videoUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("updateLessonSectionService", () => {
  beforeEach(() => {
    getEntry.mockReset();
    findSectionById.mockReset();
    findSectionByCmsEntryId.mockReset();
    updateSection.mockReset();
  });

  it("fails when the section does not exist", async () => {
    findSectionById.mockResolvedValue(null);

    const { updateLessonSectionService } = await import("./service");
    const result = await updateLessonSectionService({ id: "missing", title: "Novo título", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_sections.not_found", message: expect.any(String) },
    });
    expect(updateSection).not.toHaveBeenCalled();
  });

  it("fails when the new cmsEntryId does not reference an existing published entry", async () => {
    findSectionById.mockResolvedValue(existingSection);
    getEntry.mockResolvedValue({ success: true, data: null });

    const { updateLessonSectionService } = await import("./service");
    const result = await updateLessonSectionService({
      id: "section-1",
      cmsEntryId: "missing-entry",
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_sections.invalid_cms_entry", message: expect.any(String) },
    });
    expect(updateSection).not.toHaveBeenCalled();
  });

  it("fails when the new cmsEntryId already belongs to another section", async () => {
    findSectionById.mockResolvedValue(existingSection);
    getEntry.mockResolvedValue({ success: true, data: { id: "entry-2" } });
    findSectionByCmsEntryId.mockResolvedValue({ ...existingSection, id: "section-2", cmsEntryId: "entry-2" });

    const { updateLessonSectionService } = await import("./service");
    const result = await updateLessonSectionService({
      id: "section-1",
      cmsEntryId: "entry-2",
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_sections.cms_entry_already_in_use", message: expect.any(String) },
    });
    expect(updateSection).not.toHaveBeenCalled();
  });

  it("updates the section when input is valid", async () => {
    findSectionById.mockResolvedValue(existingSection);
    updateSection.mockResolvedValue({ ...existingSection, title: "Novo título" });

    const { updateLessonSectionService } = await import("./service");
    const result = await updateLessonSectionService({
      id: "section-1",
      title: "Novo título",
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(getEntry).not.toHaveBeenCalled();
    expect(updateSection).toHaveBeenCalledWith("section-1", {
      title: "Novo título",
      cmsEntryId: undefined,
      videoUrl: undefined,
    });
  });
});
