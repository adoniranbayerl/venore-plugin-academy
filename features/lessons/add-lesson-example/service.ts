import { getMediaAsset } from "@venore/plugin-sdk/media";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { findLessonById, findNextExamplePosition, insertLessonExample } from "./store";
import type { AddLessonExampleCommand, AddLessonExampleResult } from "./types";

export async function addLessonExample(command: AddLessonExampleCommand): Promise<AddLessonExampleResult> {
  const handle = beginOperation({
    useCase: "academy.add-lesson-example",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const lesson = await findLessonById(command.lessonId);
  if (!lesson) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${command.lessonId}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  for (const mediaId of [command.audioMediaId, command.sheetMediaId]) {
    if (!mediaId) continue;
    const media = await getMediaAsset({ id: mediaId });
    if (!media.success || !media.data) {
      const error = {
        code: "academy.lesson_examples.invalid_media",
        message: `Nenhum arquivo de mídia encontrado com id "${mediaId}".`,
      };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }
  }

  const position = await findNextExamplePosition(command.lessonId);
  const example = await insertLessonExample({
    lessonId: command.lessonId,
    title: command.title,
    audioMediaId: command.audioMediaId ?? null,
    sheetMediaId: command.sheetMediaId ?? null,
    notationData: command.notationData ?? null,
    captionText: command.captionText,
    position,
  });

  endOperation(handle, { success: true });
  return { success: true, data: example };
}
