import { count, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonActivities, lessonActivitySubmissions } from "../../../database/schema";
import type { LessonActivityRecord } from "../../../contracts/types";

export async function findLessonActivityById(id: string): Promise<LessonActivityRecord | null> {
  const [row] = await db.select().from(lessonActivities).where(eq(lessonActivities.id, id)).limit(1);
  return (row as LessonActivityRecord) ?? null;
}

export async function countActivitySubmissions(activityId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(lessonActivitySubmissions)
    .where(eq(lessonActivitySubmissions.activityId, activityId));
  return row?.value ?? 0;
}

export async function deleteLessonActivity(id: string): Promise<void> {
  await db.delete(lessonActivities).where(eq(lessonActivities.id, id));
}
