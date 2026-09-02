import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { updateCourseSettings } from "./service";
import type { UpdateCourseSettingsInput, UpdateCourseSettingsResult } from "./types";

export async function updateCourseSettingsHandler(input: UpdateCourseSettingsInput): Promise<UpdateCourseSettingsResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "academy.courses.invalid_id", message: "id não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateCourseSettings({ ...input, actorId: authz.actorId });
}
