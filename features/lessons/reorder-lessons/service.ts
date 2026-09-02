import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { findLessonsByCourse, reorderLessons } from "./store";
import type { ReorderLessonsCommand, ReorderLessonsResult } from "./types";

export async function reorderLessonsService(command: ReorderLessonsCommand): Promise<ReorderLessonsResult> {
  const handle = beginOperation({
    useCase: "academy.reorder-lessons",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findLessonsByCourse(command.courseId);
  const existingIds = new Set(existing.map((lesson) => lesson.id));
  const inputIds = new Set(command.lessonIds);

  const sameSize = existingIds.size === inputIds.size && inputIds.size === command.lessonIds.length;
  const sameMembers = sameSize && command.lessonIds.every((id) => existingIds.has(id));

  if (!sameMembers) {
    const error = {
      code: "academy.lessons.reorder_mismatch",
      message: "A lista enviada não corresponde exatamente às aulas deste curso.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const lessons = await reorderLessons(command.courseId, command.lessonIds);

  endOperation(handle, { success: true });
  return { success: true, data: lessons };
}
