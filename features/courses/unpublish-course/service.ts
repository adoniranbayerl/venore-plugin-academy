import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { findCourseById, markCourseUnpublished } from "./store";
import type { UnpublishCourseCommand, UnpublishCourseResult } from "./types";

export async function unpublishCourse(command: UnpublishCourseCommand): Promise<UnpublishCourseResult> {
  const handle = beginOperation({
    useCase: "academy.unpublish-course",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findCourseById(command.id);
  if (!existing) {
    const error = { code: "academy.courses.not_found", message: `Course "${command.id}" não encontrado.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const course = await markCourseUnpublished(command.id);

  endOperation(handle, { success: true });
  return { success: true, data: course };
}
