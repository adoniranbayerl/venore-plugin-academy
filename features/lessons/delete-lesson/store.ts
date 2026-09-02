import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonTextCompletions, lessonVideoCompletions, lessons, quizAttempts } from "../../../database/schema";
import type { LessonRecord } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

export async function hasStudentProgress(lessonId: string): Promise<boolean> {
  const [textRow] = await db
    .select({ id: lessonTextCompletions.id })
    .from(lessonTextCompletions)
    .where(eq(lessonTextCompletions.lessonId, lessonId))
    .limit(1);
  if (textRow) return true;

  const [videoRow] = await db
    .select({ id: lessonVideoCompletions.id })
    .from(lessonVideoCompletions)
    .where(eq(lessonVideoCompletions.lessonId, lessonId))
    .limit(1);
  if (videoRow) return true;

  const [attemptRow] = await db
    .select({ id: quizAttempts.id })
    .from(quizAttempts)
    .where(eq(quizAttempts.lessonId, lessonId))
    .limit(1);
  return !!attemptRow;
}

export async function deleteLessonAndRenumber(courseId: string, position: number, id: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(lessons).where(eq(lessons.id, id));
    await tx
      .update(lessons)
      .set({ position: sql`${lessons.position} - 1`, updatedAt: sql`now()` })
      .where(and(eq(lessons.courseId, courseId), gt(lessons.position, position)));
  });
}
