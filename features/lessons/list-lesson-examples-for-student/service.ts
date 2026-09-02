import { isEnrolled } from "../../../shared/enrollment";
import { isLessonAccessible } from "../../../shared/lesson-progress";
import { findLessonById, findLessonExamplesByLesson } from "./store";
import type { ListLessonExamplesForStudentCommand, ListLessonExamplesForStudentResult } from "./types";

// Mesma fronteira de segurança de list-lesson-materials-for-student — exemplo sonoro/visual é
// conteúdo da aula como texto/vídeo/material, não deveria vazar pra quem ainda não pode acessar
// a aula.
export async function listLessonExamplesForStudent(
  command: ListLessonExamplesForStudentCommand,
): Promise<ListLessonExamplesForStudentResult> {
  const lesson = await findLessonById(command.lessonId);
  if (!lesson) {
    return { success: false, error: { code: "academy.lessons.not_found", message: `Lesson "${command.lessonId}" não encontrada.` } };
  }

  const enrolled = await isEnrolled(lesson.courseId, command.actorId);
  if (!enrolled) {
    return {
      success: false,
      error: { code: "academy.enrollments.not_enrolled", message: "É necessário estar matriculado neste curso." },
    };
  }

  const accessible = await isLessonAccessible(lesson, command.actorId);
  if (!accessible) {
    return {
      success: false,
      error: { code: "academy.progress.lesson_locked", message: "A aula anterior ainda não foi completada." },
    };
  }

  const examples = await findLessonExamplesByLesson(command.lessonId);
  return { success: true, data: examples };
}
