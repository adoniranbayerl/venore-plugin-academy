import { deleteEntry } from "@venore/plugin-sdk/cms";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { collectSectionCmsEntryIds, deleteCourse, findCourseById } from "./store";
import type { DeleteCourseCommand, DeleteCourseResult } from "./types";

export async function deleteCourseService(command: DeleteCourseCommand): Promise<DeleteCourseResult> {
  const handle = beginOperation({
    useCase: "academy.delete-course",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const course = await findCourseById(command.id);
  if (!course) {
    const error = { code: "academy.courses.not_found", message: `Curso "${command.id}" não encontrado.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const cmsEntryIds = await collectSectionCmsEntryIds(command.id);

  await deleteCourse(command.id);

  // As entries ocultas das seções vivem no schema `cms` (fora do cascade). Best-effort: uma entry
  // que não apague fica órfã em /admin/cms, mas nunca faz o delete do curso falhar.
  for (const entryId of cmsEntryIds) {
    await deleteEntry({ id: entryId }).catch(() => undefined);
  }

  endOperation(handle, { success: true });
  return { success: true, data: { id: command.id } };
}
