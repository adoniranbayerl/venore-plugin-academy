import { beforeEach, describe, expect, it, vi } from "vitest";

const findQuizQuestionsByLesson = vi.fn();

vi.mock("./store", () => ({
  findQuizQuestionsByLesson: (...args: unknown[]) => findQuizQuestionsByLesson(...args),
}));

describe("listQuizQuestionsByLesson", () => {
  beforeEach(() => {
    findQuizQuestionsByLesson.mockReset();
  });

  it("returns the quiz questions of the lesson, including the correct option index", async () => {
    const questions = [
      { id: "question-1", lessonId: "lesson-1", text: "2 + 2?", options: ["3", "4"], correctOptionIndex: 1, createdAt: new Date() },
    ];
    findQuizQuestionsByLesson.mockResolvedValue(questions);

    const { listQuizQuestionsByLesson } = await import("./service");
    const result = await listQuizQuestionsByLesson({ lessonId: "lesson-1" });

    expect(result).toEqual({ success: true, data: questions });
  });
});
