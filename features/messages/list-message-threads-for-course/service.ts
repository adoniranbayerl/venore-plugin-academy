import { findThreadsByCourseAndStudent } from "../../../shared/lesson-messages-store";
import type { ListMessageThreadsForCourseQuery, ListMessageThreadsForCourseResult } from "./types";

export async function listMessageThreadsForCourse(query: ListMessageThreadsForCourseQuery): Promise<ListMessageThreadsForCourseResult> {
  const threads = await findThreadsByCourseAndStudent(query.courseId, query.studentActorId);
  return { success: true, data: threads };
}
