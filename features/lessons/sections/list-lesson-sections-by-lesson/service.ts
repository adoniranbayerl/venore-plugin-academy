import { findSectionsByLesson } from "./store";
import type { ListLessonSectionsByLessonQuery, ListLessonSectionsByLessonResult } from "./types";

export async function listLessonSectionsByLesson(
  query: ListLessonSectionsByLessonQuery,
): Promise<ListLessonSectionsByLessonResult> {
  const sections = await findSectionsByLesson(query.lessonId);
  return { success: true, data: sections };
}
