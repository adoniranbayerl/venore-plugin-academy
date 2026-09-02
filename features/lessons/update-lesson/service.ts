import { getMediaAsset } from "@venore/plugin-sdk/media";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { findLessonById, updateLesson } from "./store";
import type { UpdateLessonCommand, UpdateLessonResult } from "./types";

export async function updateLessonService(command: UpdateLessonCommand): Promise<UpdateLessonResult> {
  const handle = beginOperation({
    useCase: "academy.update-lesson",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findLessonById(command.id);
  if (!existing) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${command.id}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  if (command.coverMediaId) {
    const media = await getMediaAsset({ id: command.coverMediaId });
    if (!media.success || !media.data) {
      const error = {
        code: "academy.lessons.invalid_cover_media",
        message: `Nenhum arquivo de mídia encontrado com id "${command.coverMediaId}".`,
      };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }
  }

  const lesson = await updateLesson(command.id, {
    title: command.title,
    body: command.body,
    videoUrl: command.videoUrl,
    coverMediaId: command.coverMediaId,
  });

  endOperation(handle, { success: true });
  return { success: true, data: lesson };
}
