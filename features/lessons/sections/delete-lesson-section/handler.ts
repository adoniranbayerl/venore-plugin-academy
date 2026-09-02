import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { deleteLessonSectionService } from "./service";
import type { DeleteLessonSectionInput, DeleteLessonSectionResult } from "./types";

export async function deleteLessonSectionHandler(
  input: DeleteLessonSectionInput,
): Promise<DeleteLessonSectionResult> {
  if (input.id.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.lesson_sections.invalid_id", message: "id não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteLessonSectionService({ ...input, actorId: authz.actorId });
}
