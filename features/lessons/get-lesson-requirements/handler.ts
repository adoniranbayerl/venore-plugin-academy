import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { getLessonRequirements } from "./service";
import type { GetLessonRequirementsQuery, GetLessonRequirementsResult } from "./types";

export async function getLessonRequirementsHandler(
  query: GetLessonRequirementsQuery,
): Promise<GetLessonRequirementsResult> {
  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return getLessonRequirements(query);
}
