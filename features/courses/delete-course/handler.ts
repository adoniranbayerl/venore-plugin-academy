import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { deleteCourseService } from "./service";
import type { DeleteCourseInput, DeleteCourseResult } from "./types";

export async function deleteCourseHandler(input: DeleteCourseInput): Promise<DeleteCourseResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "academy.courses.invalid_id", message: "id não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteCourseService({ id: input.id, actorId: authz.actorId });
}
