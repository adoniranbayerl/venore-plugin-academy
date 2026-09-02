import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { listActivitySubmissionMediaForCourse } from "./service";
import type { ListActivitySubmissionMediaForCourseQuery, ListActivitySubmissionMediaForCourseResult } from "./types";

export async function listActivitySubmissionMediaForCourseHandler(
  query: ListActivitySubmissionMediaForCourseQuery,
): Promise<ListActivitySubmissionMediaForCourseResult> {
  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listActivitySubmissionMediaForCourse(query);
}
