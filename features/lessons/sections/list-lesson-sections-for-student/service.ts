import { isEnrolled } from "../../../../shared/enrollment";
import { findCompletedSectionIds, isLessonAccessible } from "../../../../shared/lesson-progress";
import { findLessonById, findSectionsByLesson } from "./store";
import type { ListLessonSectionsForStudentCommand, ListLessonSectionsForStudentResult } from "./types";

// Mesma fronteira de segurança de list-lesson-materials-for-student / list-quiz-questions-for-
// student (matrícula + cadeia de bloqueio) — seção de texto é conteúdo da aula como qualquer
// outro, não deveria vazar pra quem ainda não pode acessá-la.
export async function listLessonSectionsForStudent(
  command: ListLessonSectionsForStudentCommand,
): Promise<ListLessonSectionsForStudentResult> {
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

  const sections = await findSectionsByLesson(command.lessonId);
  const completedIds = await findCompletedSectionIds(sections.map((section) => section.id), command.actorId);
  return { success: true, data: sections.map((section) => ({ ...section, completed: completedIds.has(section.id) })) };
}
