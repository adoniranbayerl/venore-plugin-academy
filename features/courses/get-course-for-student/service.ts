import { findVisibleCourseById, findVisibleCourseBySlug } from "./store";
import type { GetCourseForStudentQuery, GetCourseForStudentResult } from "./types";

export async function getCourseForStudent(query: GetCourseForStudentQuery): Promise<GetCourseForStudentResult> {
  const course = "slug" in query ? await findVisibleCourseBySlug(query.slug) : await findVisibleCourseById(query.id);
  return { success: true, data: course };
}
