import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonMaterials, lessons } from "../../../database/schema";
import type { LessonMaterialRecord, LessonRecord } from "../../../contracts/types";

export async function findMaterialById(id: string): Promise<LessonMaterialRecord | null> {
  const [row] = await db.select().from(lessonMaterials).where(eq(lessonMaterials.id, id)).limit(1);
  return (row as LessonMaterialRecord) ?? null;
}

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}
