import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { deleteLessonMaterialService } from "./service";
import type { DeleteLessonMaterialInput, DeleteLessonMaterialResult } from "./types";

export async function deleteLessonMaterialHandler(input: DeleteLessonMaterialInput): Promise<DeleteLessonMaterialResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "academy.lesson_materials.invalid_id", message: "id não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteLessonMaterialService({ ...input, actorId: authz.actorId });
}
