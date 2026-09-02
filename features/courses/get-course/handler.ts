import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { getCourse } from "./service";
import type { GetCourseQuery, GetCourseResult } from "./types";

export async function getCourseHandler(query: GetCourseQuery): Promise<GetCourseResult> {
  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return getCourse(query);
}
