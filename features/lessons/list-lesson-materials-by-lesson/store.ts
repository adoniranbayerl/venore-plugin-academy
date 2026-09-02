import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonMaterials } from "../../../database/schema";
import type { LessonMaterialRecord } from "../../../contracts/types";

export async function findLessonMaterialsByLesson(lessonId: string): Promise<LessonMaterialRecord[]> {
  const rows = await db
    .select()
    .from(lessonMaterials)
    .where(eq(lessonMaterials.lessonId, lessonId))
    .orderBy(lessonMaterials.position);
  return rows as LessonMaterialRecord[];
}
