import { findCourseById } from "./store";
import type { GetCourseQuery, GetCourseResult } from "./types";

export async function getCourse(query: GetCourseQuery): Promise<GetCourseResult> {
  const course = await findCourseById(query.id);
  return { success: true, data: course };
}
