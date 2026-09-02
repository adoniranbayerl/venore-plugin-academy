import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { isEnrolled } from "../../../shared/enrollment";
import {
  findCompletedSectionIds,
  findLessonRequirements,
  insertSectionCompletionIfMissing,
  isLessonAccessible,
} from "../../../shared/lesson-progress";
import { onProgressAdvanced } from "../../../shared/progress-hooks";
import { markTextRead } from "../mark-text-read/service";
import { findLessonById, findSectionById, findSectionIdsByLesson } from "./store";
import type { MarkLessonSectionReadCommand, MarkLessonSectionReadResult } from "./types";

// Progresso granular por seção (pedido desta sessão) — ver comentário em database/schema/
// index.ts (lessonSectionCompletions) sobre a cascata pra lessonTextCompletions.
export async function markLessonSectionRead(command: MarkLessonSectionReadCommand): Promise<MarkLessonSectionReadResult> {
  const handle = beginOperation({
    useCase: "academy.mark-lesson-section-read",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const section = await findSectionById(command.sectionId);
  if (!section) {
    const error = {
      code: "academy.lesson_sections.not_found",
      message: `Lesson section "${command.sectionId}" não encontrada.`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const lesson = await findLessonById(section.lessonId);
  if (!lesson) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${section.lessonId}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const enrolled = await isEnrolled(lesson.courseId, command.actorId);
  if (!enrolled) {
    const error = { code: "academy.enrollments.not_enrolled", message: "É necessário estar matriculado neste curso." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const accessible = await isLessonAccessible(lesson, command.actorId);
  if (!accessible) {
    const error = { code: "academy.progress.lesson_locked", message: "A aula anterior ainda não foi completada." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await insertSectionCompletionIfMissing(section.id, command.actorId);
  await onProgressAdvanced(command.actorId, lesson.courseId);

  // Cascata: só regrava lessonTextCompletions quando o requirement está ligado e todas as seções
  // da aula já foram marcadas por este ator — markTextRead recusa sozinho se readTextEnabled
  // estiver desligado, o check aqui só evita bater no banco à toa nesse caso comum.
  const requirements = await findLessonRequirements(lesson.id);
  if (requirements?.readTextEnabled) {
    const sectionIds = await findSectionIdsByLesson(lesson.id);
    const completedIds = await findCompletedSectionIds(sectionIds, command.actorId);
    const allCompleted = sectionIds.length > 0 && sectionIds.every((id) => completedIds.has(id));
    if (allCompleted) {
      await markTextRead({ lessonId: lesson.id, actorId: command.actorId });
    }
  }

  endOperation(handle, { success: true });
  return { success: true, data: { sectionId: section.id, completed: true } };
}
