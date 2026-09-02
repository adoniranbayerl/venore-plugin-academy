import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@venore/plugin-sdk/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const addQuizQuestion = vi.fn();
vi.mock("./service", () => ({
  addQuizQuestion: (...args: unknown[]) => addQuizQuestion(...args),
}));

const baseInput = { lessonId: "lesson-1", text: "Qual intervalo?", options: ["3ª maior", "4ª justa"], correctOptionIndex: 0 };

describe("addQuizQuestionHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    addQuizQuestion.mockReset();
  });

  it("recusa menos de duas opções antes de autorizar", async () => {
    const { addQuizQuestionHandler } = await import("./handler");
    const result = await addQuizQuestionHandler({ ...baseInput, options: ["só uma"] });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.quiz.invalid_options", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  it("recusa uma pergunta 'audio' sem nenhuma notação", async () => {
    const { addQuizQuestionHandler } = await import("./handler");
    const result = await addQuizQuestionHandler({ ...baseInput, questionKind: "audio" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.quiz.audio_requires_notation", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  it("recusa optionNotations de comprimento diferente das opções", async () => {
    const { addQuizQuestionHandler } = await import("./handler");
    const result = await addQuizQuestionHandler({ ...baseInput, questionKind: "audio", optionNotations: ["X:1\nK:A\nA c"] });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.quiz.invalid_option_notations", message: expect.any(String) },
    });
  });

  it("aceita uma pergunta 'audio' com enunciado tocável, já autorizado", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    addQuizQuestion.mockResolvedValue({ success: true, data: { id: "q-1" } });

    const { addQuizQuestionHandler } = await import("./handler");
    const result = await addQuizQuestionHandler({ ...baseInput, questionKind: "audio", promptNotation: "X:1\nK:A\nA c" });

    expect(result).toEqual({ success: true, data: { id: "q-1" } });
    expect(addQuizQuestion).toHaveBeenCalledWith(
      expect.objectContaining({ questionKind: "audio", promptNotation: "X:1\nK:A\nA c", actorId: "actor-1" }),
    );
  });
});
