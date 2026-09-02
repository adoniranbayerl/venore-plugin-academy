import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { findLessonActivityById, updateLessonActivity } from "./store";
import type { UpdateLessonActivityCommand, UpdateLessonActivityResult } from "./types";

export async function updateLessonActivityService(command: UpdateLessonActivityCommand): Promise<UpdateLessonActivityResult> {
  const handle = beginOperation({
    useCase: "academy.update-lesson-activity",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findLessonActivityById(command.id);
  if (!existing) {
    const error = { code: "academy.lesson_activities.not_found", message: `Atividade "${command.id}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const activity = await updateLessonActivity(command.id, {
    title: command.title,
    instructionsText: command.instructionsText,
    deliverableFormat: command.deliverableFormat,
  });

  endOperation(handle, { success: true });
  return { success: true, data: activity };
}
