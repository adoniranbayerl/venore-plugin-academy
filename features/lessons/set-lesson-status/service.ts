import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { findLessonById, updateLessonStatus } from "./store";
import type { SetLessonStatusCommand, SetLessonStatusResult } from "./types";

export async function setLessonStatus(command: SetLessonStatusCommand): Promise<SetLessonStatusResult> {
  const handle = beginOperation({
    useCase: "academy.set-lesson-status",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findLessonById(command.id);
  if (!existing) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${command.id}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const lesson = await updateLessonStatus(command.id, command.status);

  endOperation(handle, { success: true });
  return { success: true, data: lesson };
}
