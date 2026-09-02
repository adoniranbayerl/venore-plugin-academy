import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const createEntry = vi.fn();
const getOrCreateReservedContentType = vi.fn();

vi.mock("@venore/plugin-sdk/cms", () => ({
  createEntry: (...args: unknown[]) => createEntry(...args),
  getOrCreateReservedContentType: (...args: unknown[]) => getOrCreateReservedContentType(...args),
}));

const createLessonSectionService = vi.fn();

vi.mock("../create-lesson-section/service", () => ({
  createLessonSectionService: (...args: unknown[]) => createLessonSectionService(...args),
}));

describe("createLessonTextSection", () => {
  beforeEach(() => {
    createEntry.mockReset();
    getOrCreateReservedContentType.mockReset();
    createLessonSectionService.mockReset();

    getOrCreateReservedContentType.mockResolvedValue({ id: "content-type-academy", key: "academy", name: "Academy (interno)" });
  });

  it("fails without creating a section when the hidden entry fails to be created", async () => {
    createEntry.mockResolvedValue({ success: false, error: { code: "cms.entries.slug_taken", message: "slug em uso" } });

    const { createLessonTextSection } = await import("./service");
    const result = await createLessonTextSection({ lessonId: "lesson-1", title: "Introdução", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "cms.entries.slug_taken", message: "slug em uso" } });
    expect(createLessonSectionService).not.toHaveBeenCalled();
  });

  it("creates the hidden entry tagged as academy-internal and links it to a new section", async () => {
    createEntry.mockResolvedValue({
      success: true,
      data: { id: "entry-1", title: "Introdução", internalOwner: "academy" },
    });
    createLessonSectionService.mockResolvedValue({
      success: true,
      data: { id: "section-1", lessonId: "lesson-1", position: 1, title: "Introdução", cmsEntryId: "entry-1", videoUrl: null, createdAt: new Date(), updatedAt: new Date() },
    });

    const { createLessonTextSection } = await import("./service");
    const result = await createLessonTextSection({ lessonId: "lesson-1", title: "Introdução", actorId: "actor-1" });

    expect(createEntry).toHaveBeenCalledWith(
      expect.objectContaining({ contentTypeIds: ["content-type-academy"], title: "Introdução", internalOwner: "academy" }),
    );
    expect(createLessonSectionService).toHaveBeenCalledWith(
      expect.objectContaining({ lessonId: "lesson-1", title: "Introdução", cmsEntryId: "entry-1", actorId: "actor-1" }),
    );
    expect(result.success).toBe(true);
  });
});
