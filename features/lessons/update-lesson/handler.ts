import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { updateLessonService } from "./service";
import type { UpdateLessonInput, UpdateLessonResult } from "./types";

export async function updateLessonHandler(input: UpdateLessonInput): Promise<UpdateLessonResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_id", message: "id não pode ser vazio." } };
  }

  if (input.title !== undefined && input.title.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.lessons.invalid_title", message: "title não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateLessonService({ ...input, actorId: authz.actorId });
}
