import { findLessonById } from "./store";
import type { GetLessonQuery, GetLessonResult } from "./types";

export async function getLesson(query: GetLessonQuery): Promise<GetLessonResult> {
  const lesson = await findLessonById(query.id);
  return { success: true, data: lesson };
}
