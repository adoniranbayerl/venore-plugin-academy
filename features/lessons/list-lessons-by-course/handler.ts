import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { listLessonsByCourse } from "./service";
import type { ListLessonsByCourseQuery, ListLessonsByCourseResult } from "./types";

export async function listLessonsByCourseHandler(query: ListLessonsByCourseQuery): Promise<ListLessonsByCourseResult> {
  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listLessonsByCourse(query);
}
