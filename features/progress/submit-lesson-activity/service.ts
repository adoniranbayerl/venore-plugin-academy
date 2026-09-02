import { getMediaAsset, MEDIA_ALLOWED_TYPES } from "@venore/plugin-sdk/media";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { isEnrolled } from "../../../shared/enrollment";
import { findLessonRequirements, isLessonAccessible } from "../../../shared/lesson-progress";
import { onProgressAdvanced } from "../../../shared/progress-hooks";
import { findLessonActivityById, findLessonById, upsertLessonActivitySubmission } from "./store";
import type { SubmitLessonActivityCommand, SubmitLessonActivityResult } from "./types";

// deliverableFormat "pdf" mapeia pra categoria de mídia "document" (MEDIA_ALLOWED_TYPES não tem
// noção de "pdf" separada de outros documentos) — os outros dois batem 1:1 com o nome.
const DELIVERABLE_FORMAT_TO_MEDIA_CATEGORY: Record<string, string> = { audio: "audio", image: "image", pdf: "document" };

export async function submitLessonActivity(command: SubmitLessonActivityCommand): Promise<SubmitLessonActivityResult> {
  const handle = beginOperation({
    useCase: "academy.submit-lesson-activity",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const activity = await findLessonActivityById(command.activityId);
  if (!activity) {
    const error = { code: "academy.lesson_activities.not_found", message: `Atividade "${command.activityId}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const lesson = await findLessonById(activity.lessonId);
  if (!lesson) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${activity.lessonId}" não encontrada.` };
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

  const requirements = await findLessonRequirements(lesson.id);
  if (!requirements?.activityEnabled) {
    const error = { code: "academy.lesson_activities.not_enabled", message: "Esta lesson não tem atividade prática habilitada." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  // "none": atividade sem entrega exigida (pedido desta sessão) — aluno só confirma que fez e
  // segue, sem contentText/mediaId nenhum. Único formato que pula a validação de conteúdo abaixo.
  if (activity.deliverableFormat === "text") {
    if (!command.contentText || command.contentText.trim().length === 0) {
      const error = {
        code: "academy.lesson_activities.invalid_submission_content",
        message: "Esta atividade espera um texto (contentText).",
      };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }
  } else if (activity.deliverableFormat !== "none") {
    if (!command.mediaId) {
      const error = {
        code: "academy.lesson_activities.invalid_submission_content",
        message: "Esta atividade espera um arquivo de mídia (mediaId).",
      };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }

    const media = await getMediaAsset({ id: command.mediaId });
    if (!media.success || !media.data) {
      const error = {
        code: "academy.lesson_activities.invalid_media",
        message: `Nenhum arquivo de mídia encontrado com id "${command.mediaId}".`,
      };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }

    const expectedCategory = DELIVERABLE_FORMAT_TO_MEDIA_CATEGORY[activity.deliverableFormat];
    const actualCategory = MEDIA_ALLOWED_TYPES[media.data.contentType]?.category;
    if (actualCategory !== expectedCategory) {
      const error = {
        code: "academy.lesson_activities.media_type_mismatch",
        message: `Esta atividade espera um arquivo do tipo "${activity.deliverableFormat}", mas o arquivo enviado é "${media.data.contentType}".`,
      };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }
  }

  const submission = await upsertLessonActivitySubmission({
    activityId: activity.id,
    actorId: command.actorId,
    contentText: activity.deliverableFormat === "text" ? (command.contentText ?? null) : null,
    mediaId: activity.deliverableFormat !== "text" && activity.deliverableFormat !== "none" ? (command.mediaId ?? null) : null,
    // "none" não tem o que revisar — aprovado direto, sem depender do professor (pedido desta
    // sessão). Os demais nascem "pending" e aguardam revisão real.
    initialReviewStatus: activity.deliverableFormat === "none" ? "approved" : "pending",
  });
  await onProgressAdvanced(command.actorId, lesson.courseId);

  endOperation(handle, { success: true });
  return { success: true, data: submission };
}
