import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { countActivitySubmissions, deleteLessonActivity, findLessonActivityById } from "./store";
import type { DeleteLessonActivityCommand, DeleteLessonActivityResult } from "./types";

export async function deleteLessonActivityService(command: DeleteLessonActivityCommand): Promise<DeleteLessonActivityResult> {
  const handle = beginOperation({
    useCase: "academy.delete-lesson-activity",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const activity = await findLessonActivityById(command.id);
  if (!activity) {
    const error = { code: "academy.lesson_activities.not_found", message: `Atividade "${command.id}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const submissionCount = await countActivitySubmissions(activity.id);
  if (submissionCount > 0) {
    const error = {
      code: "academy.lesson_activities.cannot_delete_has_submissions",
      message: "Não é possível remover esta atividade: já existe entrega de aluno.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await deleteLessonActivity(activity.id);

  endOperation(handle, { success: true });
  return { success: true, data: { id: activity.id } };
}
