import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { deleteLessonAndRenumber, findLessonById, hasStudentProgress } from "./store";
import type { DeleteLessonCommand, DeleteLessonResult } from "./types";

export async function deleteLessonService(command: DeleteLessonCommand): Promise<DeleteLessonResult> {
  const handle = beginOperation({
    useCase: "academy.delete-lesson",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const lesson = await findLessonById(command.id);
  if (!lesson) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${command.id}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const hasProgress = await hasStudentProgress(command.id);
  if (hasProgress) {
    const error = {
      code: "academy.lessons.cannot_delete_has_progress",
      message: "Não é possível remover esta aula: já existe progresso ou tentativa de quiz de aluno registrado.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await deleteLessonAndRenumber(lesson.courseId, lesson.position, lesson.id);

  endOperation(handle, { success: true });
  return { success: true, data: { id: lesson.id } };
}
