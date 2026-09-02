import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { listLessonExamplesByLesson } from "./service";
import type { ListLessonExamplesByLessonQuery, ListLessonExamplesByLessonResult } from "./types";

export async function listLessonExamplesByLessonHandler(
  query: ListLessonExamplesByLessonQuery,
): Promise<ListLessonExamplesByLessonResult> {
  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listLessonExamplesByLesson(query);
}
