import { findQuizQuestionsByLesson } from "./store";
import type { ListQuizQuestionsByLessonQuery, ListQuizQuestionsByLessonResult } from "./types";

// Inclui correctOptionIndex no retorno — leitura de professor, que já sabe a resposta certa
// porque foi quem cadastrou a pergunta. Não reaproveitar este handler para a tela de aluno
// responder quiz: precisa de um leitor separado que omita correctOptionIndex, senão a resposta
// certa vaza no payload antes do aluno responder.
export async function listQuizQuestionsByLesson(
  query: ListQuizQuestionsByLessonQuery,
): Promise<ListQuizQuestionsByLessonResult> {
  const questions = await findQuizQuestionsByLesson(query.lessonId);
  return { success: true, data: questions };
}
