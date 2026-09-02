import { findLessonRequirements } from "./store";
import type { GetLessonRequirementsQuery, GetLessonRequirementsResult } from "./types";

export async function getLessonRequirements(query: GetLessonRequirementsQuery): Promise<GetLessonRequirementsResult> {
  const requirements = await findLessonRequirements(query.lessonId);
  return { success: true, data: requirements };
}
