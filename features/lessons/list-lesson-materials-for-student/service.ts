import { isEnrolled } from "../../../shared/enrollment";
import { findCompletedMaterialIds, isLessonAccessible } from "../../../shared/lesson-progress";
import { findLessonById, findLessonMaterialsByLesson } from "./store";
import type { ListLessonMaterialsForStudentCommand, ListLessonMaterialsForStudentResult } from "./types";

// Mesma fronteira de segurança de list-quiz-questions-for-student (matrícula + cadeia de
// bloqueio) — material digital é conteúdo da aula como texto/vídeo, não deveria vazar pra quem
// ainda não pode acessar a aula.
export async function listLessonMaterialsForStudent(
  command: ListLessonMaterialsForStudentCommand,
): Promise<ListLessonMaterialsForStudentResult> {
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

  const materials = await findLessonMaterialsByLesson(command.lessonId);
  const completedIds = await findCompletedMaterialIds(materials.map((material) => material.id), command.actorId);
  return { success: true, data: materials.map((material) => ({ ...material, completed: completedIds.has(material.id) })) };
}
