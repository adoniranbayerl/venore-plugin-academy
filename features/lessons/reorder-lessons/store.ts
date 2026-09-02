import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessons } from "../../../database/schema";
import type { LessonRecord } from "../../../contracts/types";

export async function findLessonsByCourse(courseId: string): Promise<LessonRecord[]> {
  const rows = await db.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(asc(lessons.position));
  return rows as LessonRecord[];
}

// Duas fases pra não violar o unique index (courseId, position): primeiro joga todo mundo pra
// uma posição negativa única (garantidamente livre), só depois grava a posição final desejada.
export async function reorderLessons(courseId: string, orderedIds: string[]): Promise<LessonRecord[]> {
  return db.transaction(async (tx) => {
    for (const [index, id] of orderedIds.entries()) {
      await tx
        .update(lessons)
        .set({ position: -(index + 1), updatedAt: sql`now()` })
        .where(and(eq(lessons.id, id), eq(lessons.courseId, courseId)));
    }

    for (const [index, id] of orderedIds.entries()) {
      await tx
        .update(lessons)
        .set({ position: index + 1, updatedAt: sql`now()` })
        .where(and(eq(lessons.id, id), eq(lessons.courseId, courseId)));
    }

    const rows = await tx.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(asc(lessons.position));
    return rows as LessonRecord[];
  });
}
