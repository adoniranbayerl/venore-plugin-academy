import { findSectionById } from "./store";
import type { GetLessonSectionQuery, GetLessonSectionResult } from "./types";

export async function getLessonSection(query: GetLessonSectionQuery): Promise<GetLessonSectionResult> {
  const section = await findSectionById(query.id);
  return { success: true, data: section };
}
