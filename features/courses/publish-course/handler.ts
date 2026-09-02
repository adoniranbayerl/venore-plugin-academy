import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { publishCourse } from "./service";
import type { PublishCourseInput, PublishCourseResult } from "./types";

export async function publishCourseHandler(input: PublishCourseInput): Promise<PublishCourseResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "academy.courses.invalid_id", message: "id não pode ser vazio." } };
  }
  if (input.status !== "restricted" && input.status !== "public") {
    return {
      success: false,
      error: { code: "academy.courses.invalid_status", message: 'status deve ser "restricted" ou "public".' },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return publishCourse({ ...input, actorId: authz.actorId });
}
