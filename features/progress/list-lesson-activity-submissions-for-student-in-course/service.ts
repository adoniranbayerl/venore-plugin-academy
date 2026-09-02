import { findSubmissionsByStudentInCourse } from "./store";
import { toStudentCourseActivitySubmissionView } from "./view";
import type {
  ListLessonActivitySubmissionsForStudentInCourseQuery,
  ListLessonActivitySubmissionsForStudentInCourseResult,
} from "./types";

export async function listLessonActivitySubmissionsForStudentInCourse(
  query: ListLessonActivitySubmissionsForStudentInCourseQuery,
): Promise<ListLessonActivitySubmissionsForStudentInCourseResult> {
  const rows = await findSubmissionsByStudentInCourse(query.courseId, query.studentActorId);
  return { success: true, data: rows.map(toStudentCourseActivitySubmissionView) };
}
