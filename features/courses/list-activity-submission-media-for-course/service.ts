import { findActivitySubmissionMediaForCourse } from "./store";
import type { ListActivitySubmissionMediaForCourseQuery, ListActivitySubmissionMediaForCourseResult } from "./types";

export async function listActivitySubmissionMediaForCourse(
  query: ListActivitySubmissionMediaForCourseQuery,
): Promise<ListActivitySubmissionMediaForCourseResult> {
  const data = await findActivitySubmissionMediaForCourse(query.courseId);
  return { success: true, data };
}
