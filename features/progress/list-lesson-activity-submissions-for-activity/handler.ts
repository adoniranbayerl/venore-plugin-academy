import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { listLessonActivitySubmissionsForActivity } from "./service";
import type {
  ListLessonActivitySubmissionsForActivityQuery,
  ListLessonActivitySubmissionsForActivityResult,
} from "./types";

export async function listLessonActivitySubmissionsForActivityHandler(
  query: ListLessonActivitySubmissionsForActivityQuery,
): Promise<ListLessonActivitySubmissionsForActivityResult> {
  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listLessonActivitySubmissionsForActivity(query);
}
