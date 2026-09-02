import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonActivitySubmissions } from "../../../database/schema";
import type { LessonActivitySubmissionRecord } from "../../../contracts/types";

export async function findSubmissionsByActivity(activityId: string): Promise<LessonActivitySubmissionRecord[]> {
  const rows = await db
    .select()
    .from(lessonActivitySubmissions)
    .where(eq(lessonActivitySubmissions.activityId, activityId))
    .orderBy(lessonActivitySubmissions.submittedAt);
  return rows as LessonActivitySubmissionRecord[];
}
