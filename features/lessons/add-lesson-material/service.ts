import { getMediaAsset } from "@venore/plugin-sdk/media";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { findLessonById, findNextMaterialPosition, insertLessonMaterial } from "./store";
import type { AddLessonMaterialCommand, AddLessonMaterialResult } from "./types";

export async function addLessonMaterial(command: AddLessonMaterialCommand): Promise<AddLessonMaterialResult> {
  const handle = beginOperation({
    useCase: "academy.add-lesson-material",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const lesson = await findLessonById(command.lessonId);
  if (!lesson) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${command.lessonId}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const media = await getMediaAsset({ id: command.mediaId });
  if (!media.success || !media.data) {
    const error = {
      code: "academy.lesson_materials.invalid_media",
      message: `Nenhum arquivo de mídia encontrado com id "${command.mediaId}".`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const position = await findNextMaterialPosition(command.lessonId);
  const material = await insertLessonMaterial({
    lessonId: command.lessonId,
    mediaId: command.mediaId,
    label: command.label,
    position,
  });

  endOperation(handle, { success: true });
  return { success: true, data: material };
}
