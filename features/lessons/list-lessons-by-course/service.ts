import { findLessonsByCourse } from "./store";
import type { ListLessonsByCourseQuery, ListLessonsByCourseResult } from "./types";

export async function listLessonsByCourse(query: ListLessonsByCourseQuery): Promise<ListLessonsByCourseResult> {
  const lessons = await findLessonsByCourse(query.courseId);
  return { success: true, data: lessons };
}
