import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { listMessageThreadsForCourse } from "./service";
import type { ListMessageThreadsForCourseQuery, ListMessageThreadsForCourseResult } from "./types";

export async function listMessageThreadsForCourseHandler(
  query: ListMessageThreadsForCourseQuery,
): Promise<ListMessageThreadsForCourseResult> {
  if (query.courseId.trim().length === 0) {
    return { success: false, error: { code: "academy.courses.invalid_id", message: "courseId não pode ser vazio." } };
  }
  if (query.studentActorId.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.progress.invalid_student_id", message: "studentActorId não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listMessageThreadsForCourse(query);
}
