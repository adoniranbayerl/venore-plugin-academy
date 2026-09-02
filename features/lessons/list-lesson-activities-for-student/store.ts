import { and, eq, inArray } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonActivities, lessonActivitySubmissions, lessons } from "../../../database/schema";
import type { LessonActivityRecord, LessonActivitySubmissionRecord, LessonRecord } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

export async function findLessonActivitiesByLesson(lessonId: string): Promise<LessonActivityRecord[]> {
  const rows = await db
    .select()
    .from(lessonActivities)
    .where(eq(lessonActivities.lessonId, lessonId))
    .orderBy(lessonActivities.position);
  return rows as LessonActivityRecord[];
}

export async function findSubmissionsByActorForActivities(
  activityIds: string[],
  actorId: string,
): Promise<LessonActivitySubmissionRecord[]> {
  if (activityIds.length === 0) return [];
  const rows = await db
    .select()
    .from(lessonActivitySubmissions)
    .where(and(inArray(lessonActivitySubmissions.activityId, activityIds), eq(lessonActivitySubmissions.actorId, actorId)));
  return rows as LessonActivitySubmissionRecord[];
}
