import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@venore/plugin-sdk/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const addLessonExample = vi.fn();
vi.mock("./service", () => ({
  addLessonExample: (...args: unknown[]) => addLessonExample(...args),
}));

describe("addLessonExampleHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    addLessonExample.mockReset();
  });

  it("fails when neither media nor notation is provided", async () => {
    const { addLessonExampleHandler } = await import("./handler");
    const result = await addLessonExampleHandler({ lessonId: "lesson-1", title: "Exemplo", captionText: "Legenda" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_examples.missing_media", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  it("fails when notationData is combined with audioMediaId", async () => {
    const { addLessonExampleHandler } = await import("./handler");
    const result = await addLessonExampleHandler({
      lessonId: "lesson-1",
      title: "Exemplo",
      captionText: "Legenda",
      notationData: "X:1\nK:C\nC2",
      audioMediaId: "media-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_examples.mixed_source", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  it("fails when notationData is blank", async () => {
    const { addLessonExampleHandler } = await import("./handler");
    const result = await addLessonExampleHandler({
      lessonId: "lesson-1",
      title: "Exemplo",
      captionText: "Legenda",
      notationData: "   ",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_examples.invalid_notation", message: expect.any(String) },
    });
  });

  it("accepts a notation-only example once authorized", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    addLessonExample.mockResolvedValue({ success: true, data: { id: "example-1" } });

    const { addLessonExampleHandler } = await import("./handler");
    const result = await addLessonExampleHandler({
      lessonId: "lesson-1",
      title: "Exemplo",
      captionText: "Legenda",
      notationData: "X:1\nK:C\nC2",
    });

    expect(result).toEqual({ success: true, data: { id: "example-1" } });
    expect(addLessonExample).toHaveBeenCalledWith(
      expect.objectContaining({ notationData: "X:1\nK:C\nC2", actorId: "actor-1" }),
    );
  });
});
