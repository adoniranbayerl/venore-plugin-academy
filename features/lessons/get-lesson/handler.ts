import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { getLesson } from "./service";
import type { GetLessonQuery, GetLessonResult } from "./types";

export async function getLessonHandler(query: GetLessonQuery): Promise<GetLessonResult> {
  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return getLesson(query);
}
