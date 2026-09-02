import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { validateQuizAudioShape } from "../../../shared/quiz-audio";
import { addQuizQuestion } from "./service";
import type { AddQuizQuestionInput, AddQuizQuestionResult } from "./types";

export async function addQuizQuestionHandler(input: AddQuizQuestionInput): Promise<AddQuizQuestionResult> {
  if (input.lessonId.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_id", message: "lessonId não pode ser vazio." } };
  }

  if (input.text.trim().length === 0) {
    return { success: false, error: { code: "academy.quiz.invalid_text", message: "O texto da pergunta não pode ser vazio." } };
  }

  if (input.options.length < 2) {
    return {
      success: false,
      error: { code: "academy.quiz.invalid_options", message: "A pergunta precisa de pelo menos 2 opções." },
    };
  }

  if (input.correctOptionIndex < 0 || input.correctOptionIndex >= input.options.length) {
    return {
      success: false,
      error: { code: "academy.quiz.invalid_correct_option", message: "correctOptionIndex precisa apontar pra uma opção existente." },
    };
  }

  const audioError = validateQuizAudioShape({
    questionKind: input.questionKind ?? "text",
    options: input.options,
    optionNotations: input.optionNotations ?? null,
    promptNotation: input.promptNotation ?? null,
  });
  if (audioError) {
    return { success: false, error: audioError };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return addQuizQuestion({ ...input, actorId: authz.actorId });
}
