import { getMediaAsset } from "@venore/plugin-sdk/media";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { findNextPosition, insertLesson } from "./store";
import type { CreateLessonCommand, CreateLessonResult } from "./types";

export async function createLesson(command: CreateLessonCommand): Promise<CreateLessonResult> {
  const handle = beginOperation({
    useCase: "academy.create-lesson",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

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

  const position = await findNextPosition(command.courseId);
  const lesson = await insertLesson({
    courseId: command.courseId,
    title: command.title,
    body: command.body,
    videoUrl: command.videoUrl,
    coverMediaId: command.coverMediaId,
    position,
  });

  endOperation(handle, { success: true });
  return { success: true, data: lesson };
}
