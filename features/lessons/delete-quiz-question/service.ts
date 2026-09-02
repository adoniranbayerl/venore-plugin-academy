import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { deleteQuizQuestion, findQuizAttemptsByLesson, findQuizQuestionById } from "./store";
import type { DeleteQuizQuestionCommand, DeleteQuizQuestionResult } from "./types";

export async function deleteQuizQuestionService(command: DeleteQuizQuestionCommand): Promise<DeleteQuizQuestionResult> {
  const handle = beginOperation({
    useCase: "academy.delete-quiz-question",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const question = await findQuizQuestionById(command.id);
  if (!question) {
    const error = { code: "academy.quiz.not_found", message: `Quiz question "${command.id}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const attempts = await findQuizAttemptsByLesson(question.lessonId);
  const hasAttempt = attempts.some((attempt) => attempt.answers.some((answer) => answer.questionId === question.id));

  if (hasAttempt) {
    const error = {
      code: "academy.quiz.cannot_delete_has_attempts",
      message: "Não é possível remover esta pergunta: já existe tentativa de aluno que a respondeu.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await deleteQuizQuestion(question.id);

  endOperation(handle, { success: true });
  return { success: true, data: { id: question.id } };
}
