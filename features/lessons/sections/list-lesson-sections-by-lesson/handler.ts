import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { listLessonSectionsByLesson } from "./service";
import type { ListLessonSectionsByLessonQuery, ListLessonSectionsByLessonResult } from "./types";

export async function listLessonSectionsByLessonHandler(
  query: ListLessonSectionsByLessonQuery,
): Promise<ListLessonSectionsByLessonResult> {
  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listLessonSectionsByLesson(query);
}
