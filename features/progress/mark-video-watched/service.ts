import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { isEnrolled } from "../../../shared/enrollment";
import { findLessonRequirements, isLessonAccessible } from "../../../shared/lesson-progress";
import { onProgressAdvanced } from "../../../shared/progress-hooks";
import { findLessonById, insertVideoCompletionIfMissing } from "./store";
import type { MarkVideoWatchedCommand, MarkVideoWatchedResult } from "./types";

export async function markVideoWatched(command: MarkVideoWatchedCommand): Promise<MarkVideoWatchedResult> {
  const handle = beginOperation({
    useCase: "academy.mark-video-watched",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const lesson = await findLessonById(command.lessonId);
  if (!lesson) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${command.lessonId}" não encontrada.` };
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
    const error = {
      code: "academy.progress.lesson_locked",
      message: "A aula anterior ainda não foi completada.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const requirements = await findLessonRequirements(command.lessonId);
  if (!requirements?.watchVideoEnabled) {
    const error = {
      code: "academy.progress.requirement_not_enabled",
      message: "Esta lesson não exige confirmação de vídeo assistido.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await insertVideoCompletionIfMissing(command.lessonId, command.actorId);
  await onProgressAdvanced(command.actorId, lesson.courseId);

  endOperation(handle, { success: true });
  return { success: true, data: { lessonId: command.lessonId, completed: true } };
}
