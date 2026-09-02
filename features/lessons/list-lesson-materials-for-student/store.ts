import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonMaterials, lessons } from "../../../database/schema";
import type { LessonMaterialRecord, LessonRecord } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

export async function findLessonMaterialsByLesson(lessonId: string): Promise<LessonMaterialRecord[]> {
  const rows = await db
    .select()
    .from(lessonMaterials)
    .where(eq(lessonMaterials.lessonId, lessonId))
    .orderBy(lessonMaterials.position);
  return rows as LessonMaterialRecord[];
}
