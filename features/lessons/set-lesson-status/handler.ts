import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { setLessonStatus } from "./service";
import type { SetLessonStatusInput, SetLessonStatusResult } from "./types";

const VALID_STATUSES = ["draft", "restricted", "public"];

export async function setLessonStatusHandler(input: SetLessonStatusInput): Promise<SetLessonStatusResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_id", message: "id não pode ser vazio." } };
  }
  if (!VALID_STATUSES.includes(input.status)) {
    return {
      success: false,
      error: { code: "academy.lessons.invalid_status", message: 'status deve ser "draft", "restricted" ou "public".' },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return setLessonStatus({ ...input, actorId: authz.actorId });
}
