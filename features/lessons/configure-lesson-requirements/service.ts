import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { countLessonActivities, findLessonById, upsertLessonRequirements } from "./store";
import type { ConfigureLessonRequirementsCommand, ConfigureLessonRequirementsResult } from "./types";

export async function configureLessonRequirements(command: ConfigureLessonRequirementsCommand): Promise<ConfigureLessonRequirementsResult> {
  const handle = beginOperation({
    useCase: "academy.configure-lesson-requirements",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const lesson = await findLessonById(command.lessonId);
  if (!lesson) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${command.lessonId}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  if (command.watchVideoEnabled && !lesson.videoUrl) {
    const error = {
      code: "academy.lessons.missing_video_url",
      message: "watchVideoEnabled não pode ser habilitado: a lesson não tem videoUrl.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  if (command.activityEnabled && (await countLessonActivities(command.lessonId)) === 0) {
    const error = {
      code: "academy.lessons.missing_lesson_activity",
      message: "activityEnabled não pode ser habilitado: a lesson não tem nenhuma atividade prática cadastrada.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const requirements = await upsertLessonRequirements({
    lessonId: command.lessonId,
    readTextEnabled: command.readTextEnabled,
    watchVideoEnabled: command.watchVideoEnabled,
    quizEnabled: command.quizEnabled,
    quizPassThresholdPercent: command.quizPassThresholdPercent,
    quizMaxAttempts: command.quizMaxAttempts,
    activityEnabled: command.activityEnabled,
  });

  endOperation(handle, { success: true });
  return { success: true, data: requirements };
}
