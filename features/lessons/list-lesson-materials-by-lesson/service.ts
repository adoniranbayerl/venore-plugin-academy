import { findLessonMaterialsByLesson } from "./store";
import type { ListLessonMaterialsByLessonQuery, ListLessonMaterialsByLessonResult } from "./types";

export async function listLessonMaterialsByLesson(
  query: ListLessonMaterialsByLessonQuery,
): Promise<ListLessonMaterialsByLessonResult> {
  const materials = await findLessonMaterialsByLesson(query.lessonId);
  return { success: true, data: materials };
}
