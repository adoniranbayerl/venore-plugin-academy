import { isEnrolled } from "../../../shared/enrollment";
import { findLessonById, findMessagesByThread, findThreadByKey } from "./store";
import type { GetMessageThreadQuery, GetMessageThreadResult } from "./types";

// Só checa matrícula, não isLessonAccessible — ver histórico do que já foi perguntado antes não
// deveria depender de a aula ainda estar "desbloqueada" no momento da leitura (só mandar mensagem
// nova é que exige isso, ver send-student-message/service.ts).
export async function getMessageThread(query: GetMessageThreadQuery): Promise<GetMessageThreadResult> {
  const lesson = await findLessonById(query.lessonId);
  if (!lesson) {
    return { success: false, error: { code: "academy.lessons.not_found", message: `Lesson "${query.lessonId}" não encontrada.` } };
  }

  const enrolled = await isEnrolled(lesson.courseId, query.actorId);
  if (!enrolled) {
    return { success: false, error: { code: "academy.enrollments.not_enrolled", message: "É necessário estar matriculado neste curso." } };
  }

  const thread = await findThreadByKey(query.lessonId, query.stepKey, query.actorId);
  const messages = thread ? await findMessagesByThread(thread.id) : [];

  return { success: true, data: { thread, messages } };
}
