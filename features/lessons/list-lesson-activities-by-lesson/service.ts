import { findLessonActivitiesByLesson } from "./store";
import type { ListLessonActivitiesByLessonQuery, ListLessonActivitiesByLessonResult } from "./types";

export async function listLessonActivitiesByLesson(
  query: ListLessonActivitiesByLessonQuery,
): Promise<ListLessonActivitiesByLessonResult> {
  const activities = await findLessonActivitiesByLesson(query.lessonId);
  return { success: true, data: activities };
}
