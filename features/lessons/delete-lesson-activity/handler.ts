import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { deleteLessonActivityService } from "./service";
import type { DeleteLessonActivityInput, DeleteLessonActivityResult } from "./types";

export async function deleteLessonActivityHandler(input: DeleteLessonActivityInput): Promise<DeleteLessonActivityResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "academy.lesson_activities.invalid_id", message: "id não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteLessonActivityService({ ...input, actorId: authz.actorId });
}
