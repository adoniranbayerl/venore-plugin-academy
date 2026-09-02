import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { listLessonMaterialsByLesson } from "./service";
import type { ListLessonMaterialsByLessonQuery, ListLessonMaterialsByLessonResult } from "./types";

export async function listLessonMaterialsByLessonHandler(
  query: ListLessonMaterialsByLessonQuery,
): Promise<ListLessonMaterialsByLessonResult> {
  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listLessonMaterialsByLesson(query);
}
