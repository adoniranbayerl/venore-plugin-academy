import { findLessonExamplesByLesson } from "./store";
import type { ListLessonExamplesByLessonQuery, ListLessonExamplesByLessonResult } from "./types";

export async function listLessonExamplesByLesson(
  query: ListLessonExamplesByLessonQuery,
): Promise<ListLessonExamplesByLessonResult> {
  const examples = await findLessonExamplesByLesson(query.lessonId);
  return { success: true, data: examples };
}
