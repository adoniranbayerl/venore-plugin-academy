import { describe, expect, it } from "vitest";
import { validateQuizAudioShape } from "./quiz-audio";

describe("validateQuizAudioShape", () => {
  it("aceita uma pergunta de texto comum", () => {
    expect(
      validateQuizAudioShape({ questionKind: "text", options: ["a", "b"], optionNotations: null, promptNotation: null }),
    ).toBeNull();
  });

  it("recusa optionNotations com comprimento diferente de options", () => {
    const error = validateQuizAudioShape({
      questionKind: "text",
      options: ["a", "b", "c"],
      optionNotations: ["X:1", null],
      promptNotation: null,
    });
    expect(error?.code).toBe("academy.quiz.invalid_option_notations");
  });

  it("recusa uma pergunta de áudio sem nenhuma notação", () => {
    const error = validateQuizAudioShape({
      questionKind: "audio",
      options: ["a", "b"],
      optionNotations: [null, null],
      promptNotation: "   ",
    });
    expect(error?.code).toBe("academy.quiz.audio_requires_notation");
  });

  it("aceita áudio quando o enunciado tem notação", () => {
    expect(
      validateQuizAudioShape({
        questionKind: "audio",
        options: ["3ª maior", "4ª justa"],
        optionNotations: null,
        promptNotation: "X:1\nK:A\nA c",
      }),
    ).toBeNull();
  });

  it("aceita áudio quando ao menos uma opção tem notação", () => {
    expect(
      validateQuizAudioShape({
        questionKind: "audio",
        options: ["opção A", "opção B"],
        optionNotations: [null, "X:1\nK:A\nA e"],
        promptNotation: null,
      }),
    ).toBeNull();
  });
});
