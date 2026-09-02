import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { submitQuizAttempt } from "./service";
import type { SubmitQuizAttemptInput, SubmitQuizAttemptResult } from "./types";

export async function submitQuizAttemptHandler(input: SubmitQuizAttemptInput): Promise<SubmitQuizAttemptResult> {
  if (input.lessonId.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_id", message: "lessonId não pode ser vazio." } };
  }

  if (input.answers.length === 0) {
    return { success: false, error: { code: "academy.quiz.invalid_answers", message: "answers não pode ser vazio." } };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return submitQuizAttempt({ ...input, actorId: currentUser.data.id });
}
