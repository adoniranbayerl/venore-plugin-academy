import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { listQuizProgressForCourse } from "./service";
import type { ListQuizProgressForCourseQuery, ListQuizProgressForCourseResult } from "./types";

export async function listQuizProgressForCourseHandler(
  query: ListQuizProgressForCourseQuery,
): Promise<ListQuizProgressForCourseResult> {
  if (query.courseId.trim().length === 0) {
    return { success: false, error: { code: "academy.courses.invalid_id", message: "courseId não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listQuizProgressForCourse(query);
}
