import { isEnrolled as checkEnrolled } from "../../../shared/enrollment";
import type { IsEnrolledQuery, IsEnrolledResult } from "./types";

export async function isEnrolled(query: IsEnrolledQuery): Promise<IsEnrolledResult> {
  return { success: true, data: await checkEnrolled(query.courseId, query.actorId) };
}
