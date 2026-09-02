import { beforeEach, describe, expect, it, vi } from "vitest";

const findLessonRequirements = vi.fn();

vi.mock("./store", () => ({
  findLessonRequirements: (...args: unknown[]) => findLessonRequirements(...args),
}));

describe("getLessonRequirements", () => {
  beforeEach(() => {
    findLessonRequirements.mockReset();
  });

  it("returns the requirements when already configured", async () => {
    const requirements = {
      lessonId: "lesson-1",
      readTextEnabled: true,
      watchVideoEnabled: false,
      quizEnabled: false,
      quizPassThresholdPercent: null,
      quizMaxAttempts: null,
      updatedAt: new Date(),
    };
    findLessonRequirements.mockResolvedValue(requirements);

    const { getLessonRequirements } = await import("./service");
    const result = await getLessonRequirements({ lessonId: "lesson-1" });

    expect(result).toEqual({ success: true, data: requirements });
  });

  it("returns null data when the lesson has no requirements configured yet", async () => {
    findLessonRequirements.mockResolvedValue(null);

    const { getLessonRequirements } = await import("./service");
    const result = await getLessonRequirements({ lessonId: "lesson-1" });

    expect(result).toEqual({ success: true, data: null });
  });
});
