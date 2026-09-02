import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { deleteLessonExampleService } from "./service";
import type { DeleteLessonExampleInput, DeleteLessonExampleResult } from "./types";

export async function deleteLessonExampleHandler(input: DeleteLessonExampleInput): Promise<DeleteLessonExampleResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "academy.lesson_examples.invalid_id", message: "id não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteLessonExampleService({ ...input, actorId: authz.actorId });
}
