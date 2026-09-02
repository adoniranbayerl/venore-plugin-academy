import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { listCourses } from "./service";
import type { ListCoursesResult } from "./types";

export async function listCoursesHandler(): Promise<ListCoursesResult> {
  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listCourses();
}
