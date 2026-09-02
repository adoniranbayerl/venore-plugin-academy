import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { listLessonActivitiesByLesson } from "./service";
import type { ListLessonActivitiesByLessonQuery, ListLessonActivitiesByLessonResult } from "./types";

export async function listLessonActivitiesByLessonHandler(
  query: ListLessonActivitiesByLessonQuery,
): Promise<ListLessonActivitiesByLessonResult> {
  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listLessonActivitiesByLesson(query);
}
