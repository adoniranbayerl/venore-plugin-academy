import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { addLessonMaterial } from "./service";
import type { AddLessonMaterialInput, AddLessonMaterialResult } from "./types";

export async function addLessonMaterialHandler(input: AddLessonMaterialInput): Promise<AddLessonMaterialResult> {
  if (input.lessonId.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_id", message: "lessonId não pode ser vazio." } };
  }

  if (input.mediaId.trim().length === 0) {
    return { success: false, error: { code: "academy.lesson_materials.invalid_media", message: "mediaId não pode ser vazio." } };
  }

  if (input.label.trim().length === 0) {
    return { success: false, error: { code: "academy.lesson_materials.invalid_label", message: "O rótulo não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return addLessonMaterial({ ...input, actorId: authz.actorId });
}
