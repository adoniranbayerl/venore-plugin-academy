import type { QuizQuestionKind } from "../contracts/types";

// Validação de forma de uma pergunta de quiz "audio" (treino de ouvido — docs/academy-recursos-
// musicais.md #2). Pura e compartilhada entre criar (add-quiz-question) e editar
// (update-quiz-question, passando o estado FINAL já mesclado com o que já estava salvo). Fica
// aqui, não no banco: a regra compara colunas entre si de um jeito que um check() do Postgres não
// expressa com clareza.

export type QuizAudioShape = {
  questionKind: QuizQuestionKind;
  options: string[];
  optionNotations: (string | null)[] | null;
  promptNotation: string | null;
};

export type QuizAudioError = { code: string; message: string };

export function validateQuizAudioShape(shape: QuizAudioShape): QuizAudioError | null {
  if (shape.optionNotations && shape.optionNotations.length !== shape.options.length) {
    return {
      code: "academy.quiz.invalid_option_notations",
      message: "A lista de notações das opções precisa ter o mesmo número de itens que as opções.",
    };
  }

  if (shape.questionKind === "audio") {
    const hasPrompt = typeof shape.promptNotation === "string" && shape.promptNotation.trim().length > 0;
    const hasOptionAudio =
      !!shape.optionNotations && shape.optionNotations.some((notation) => typeof notation === "string" && notation.trim().length > 0);
    if (!hasPrompt && !hasOptionAudio) {
      return {
        code: "academy.quiz.audio_requires_notation",
        message: "Uma pergunta de áudio precisa de notação no enunciado ou em pelo menos uma opção.",
      };
    }
  }

  return null;
}
