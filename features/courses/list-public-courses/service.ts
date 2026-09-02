import { findPublicListedCourses } from "./store";
import type { ListPublicCoursesResult } from "./types";

export async function listPublicCourses(): Promise<ListPublicCoursesResult> {
  const data = await findPublicListedCourses();
  return { success: true, data };
}
