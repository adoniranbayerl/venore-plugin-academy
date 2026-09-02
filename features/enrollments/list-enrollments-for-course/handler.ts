import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { listEnrollmentsForCourse } from "./service";
import type { ListEnrollmentsForCourseQuery, ListEnrollmentsForCourseResult } from "./types";

export async function listEnrollmentsForCourseHandler(
  query: ListEnrollmentsForCourseQuery,
): Promise<ListEnrollmentsForCourseResult> {
  if (query.courseId.trim().length === 0) {
    return { success: false, error: { code: "academy.enrollments.invalid_course_id", message: "courseId não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listEnrollmentsForCourse(query);
}
