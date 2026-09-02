import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { getLessonSection } from "./service";
import type { GetLessonSectionQuery, GetLessonSectionResult } from "./types";

export async function getLessonSectionHandler(query: GetLessonSectionQuery): Promise<GetLessonSectionResult> {
  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return getLessonSection(query);
}
