import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { unpublishCourse } from "./service";
import type { UnpublishCourseInput, UnpublishCourseResult } from "./types";

export async function unpublishCourseHandler(input: UnpublishCourseInput): Promise<UnpublishCourseResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "academy.courses.invalid_id", message: "id não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return unpublishCourse({ ...input, actorId: authz.actorId });
}
