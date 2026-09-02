import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { deleteLessonService } from "./service";
import type { DeleteLessonInput, DeleteLessonResult } from "./types";

export async function deleteLessonHandler(input: DeleteLessonInput): Promise<DeleteLessonResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_id", message: "id não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteLessonService({ ...input, actorId: authz.actorId });
}
