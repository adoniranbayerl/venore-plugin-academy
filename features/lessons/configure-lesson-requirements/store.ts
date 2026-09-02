import { count, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonActivities, lessonRequirements, lessons } from "../../../database/schema";
import type { LessonRecord, LessonRequirementsRecord } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

export async function countLessonActivities(lessonId: string): Promise<number> {
  const [row] = await db.select({ value: count() }).from(lessonActivities).where(eq(lessonActivities.lessonId, lessonId));
  return row?.value ?? 0;
}

export async function upsertLessonRequirements(input: {
  lessonId: string;
  readTextEnabled: boolean;
  watchVideoEnabled: boolean;
  quizEnabled: boolean;
  quizPassThresholdPercent?: number;
  quizMaxAttempts?: number;
  activityEnabled: boolean;
}): Promise<LessonRequirementsRecord> {
  const values = {
    lessonId: input.lessonId,
    readTextEnabled: input.readTextEnabled,
    watchVideoEnabled: input.watchVideoEnabled,
    quizEnabled: input.quizEnabled,
    quizPassThresholdPercent: input.quizPassThresholdPercent ?? null,
    quizMaxAttempts: input.quizMaxAttempts ?? null,
    activityEnabled: input.activityEnabled,
  };

  const [row] = await db
    .insert(lessonRequirements)
    .values(values)
    .onConflictDoUpdate({
      target: lessonRequirements.lessonId,
      set: { ...values, updatedAt: new Date() },
    })
    .returning();

  return row as LessonRequirementsRecord;
}
