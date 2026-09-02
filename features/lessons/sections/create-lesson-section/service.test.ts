import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const getEntry = vi.fn();

vi.mock("@venore/plugin-sdk/cms", () => ({
  getEntry: (...args: unknown[]) => getEntry(...args),
}));

const findLessonById = vi.fn();
const findSectionByCmsEntryId = vi.fn();
const findNextPosition = vi.fn();
const insertSection = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  findSectionByCmsEntryId: (...args: unknown[]) => findSectionByCmsEntryId(...args),
  findNextPosition: (...args: unknown[]) => findNextPosition(...args),
  insertSection: (...args: unknown[]) => insertSection(...args),
}));

describe("createLessonSectionService", () => {
  beforeEach(() => {
    getEntry.mockReset();
    findLessonById.mockReset();
    findSectionByCmsEntryId.mockReset();
    findNextPosition.mockReset();
    insertSection.mockReset();
  });

  it("fails when the lesson does not exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { createLessonSectionService } = await import("./service");
    const result = await createLessonSectionService({
      lessonId: "missing-lesson",
      title: "Intro",
      videoUrl: "https://example.test/video.mp4",
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_sections.lesson_not_found", message: expect.any(String) },
    });
    expect(insertSection).not.toHaveBeenCalled();
  });

  it("fails when the cmsEntryId does not reference an existing published entry", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1" });
    getEntry.mockResolvedValue({ success: true, data: null });

    const { createLessonSectionService } = await import("./service");
    const result = await createLessonSectionService({
      lessonId: "lesson-1",
      title: "Intro",
      cmsEntryId: "missing-entry",
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_sections.invalid_cms_entry", message: expect.any(String) },
    });
    expect(insertSection).not.toHaveBeenCalled();
  });

  it("fails when the cmsEntryId already belongs to another section", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1" });
    getEntry.mockResolvedValue({ success: true, data: { id: "entry-1" } });
    findSectionByCmsEntryId.mockResolvedValue({
      id: "section-other",
      lessonId: "lesson-2",
      position: 1,
      title: "Outra seção",
      cmsEntryId: "entry-1",
      videoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { createLessonSectionService } = await import("./service");
    const result = await createLessonSectionService({
      lessonId: "lesson-1",
      title: "Intro",
      cmsEntryId: "entry-1",
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_sections.cms_entry_already_in_use", message: expect.any(String) },
    });
    expect(insertSection).not.toHaveBeenCalled();
  });

  it("creates the section at the next available position when input is valid", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1" });
    getEntry.mockResolvedValue({ success: true, data: { id: "entry-1" } });
    findSectionByCmsEntryId.mockResolvedValue(null);
    findNextPosition.mockResolvedValue(2);
    insertSection.mockResolvedValue({
      id: "section-1",
      lessonId: "lesson-1",
      position: 2,
      title: "Intro",
      cmsEntryId: "entry-1",
      videoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { createLessonSectionService } = await import("./service");
    const result = await createLessonSectionService({
      lessonId: "lesson-1",
      title: "Intro",
      cmsEntryId: "entry-1",
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(insertSection).toHaveBeenCalledWith({
      lessonId: "lesson-1",
      title: "Intro",
      cmsEntryId: "entry-1",
      videoUrl: undefined,
      position: 2,
    });
  });
});
