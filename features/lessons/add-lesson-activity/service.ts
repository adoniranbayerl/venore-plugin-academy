import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { findLessonById, findNextActivityPosition, insertLessonActivity } from "./store";
import type { AddLessonActivityCommand, AddLessonActivityResult } from "./types";

export async function addLessonActivity(command: AddLessonActivityCommand): Promise<AddLessonActivityResult> {
  const handle = beginOperation({
    useCase: "academy.add-lesson-activity",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const lesson = await findLessonById(command.lessonId);
  if (!lesson) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${command.lessonId}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const position = await findNextActivityPosition(command.lessonId);
  const activity = await insertLessonActivity({
    lessonId: command.lessonId,
    title: command.title,
    instructionsText: command.instructionsText,
    deliverableFormat: command.deliverableFormat,
    position,
  });

  endOperation(handle, { success: true });
  return { success: true, data: activity };
}
