import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonSections } from "../../../../database/schema";
import type { LessonSectionRecord } from "../../../../contracts/types";

export async function findSectionsByLesson(lessonId: string): Promise<LessonSectionRecord[]> {
  const rows = await db
    .select()
    .from(lessonSections)
    .where(eq(lessonSections.lessonId, lessonId))
    .orderBy(asc(lessonSections.position));
  return rows as LessonSectionRecord[];
}

// Mesmo problema de unique(lessonId, position) que reorder-lessons resolveu: primeiro joga todo
// mundo pra uma posição negativa única (garantidamente livre), só depois grava a posição final.
export async function reorderSections(lessonId: string, orderedIds: string[]): Promise<LessonSectionRecord[]> {
  return db.transaction(async (tx) => {
    for (const [index, id] of orderedIds.entries()) {
      await tx
        .update(lessonSections)
        .set({ position: -(index + 1), updatedAt: sql`now()` })
        .where(and(eq(lessonSections.id, id), eq(lessonSections.lessonId, lessonId)));
    }

    for (const [index, id] of orderedIds.entries()) {
      await tx
        .update(lessonSections)
        .set({ position: index + 1, updatedAt: sql`now()` })
        .where(and(eq(lessonSections.id, id), eq(lessonSections.lessonId, lessonId)));
    }

    const rows = await tx
      .select()
      .from(lessonSections)
      .where(eq(lessonSections.lessonId, lessonId))
      .orderBy(asc(lessonSections.position));
    return rows as LessonSectionRecord[];
  });
}
