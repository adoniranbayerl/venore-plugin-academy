import { findAllCourses } from "./store";
import type { ListCoursesResult } from "./types";

export async function listCourses(): Promise<ListCoursesResult> {
  const courses = await findAllCourses();
  return { success: true, data: courses };
}
