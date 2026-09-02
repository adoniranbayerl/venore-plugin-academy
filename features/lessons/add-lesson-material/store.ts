import { eq, max } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonMaterials, lessons } from "../../../database/schema";
import type { LessonMaterialRecord, LessonRecord } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

// max(position)+1, não count()+1 — count() colide quando um material do meio da sequência já foi
// excluído (mesmo bug de posição corrigido em add-lesson-example/store.ts nesta sessão).
export async function findNextMaterialPosition(lessonId: string): Promise<number> {
  const [row] = await db.select({ value: max(lessonMaterials.position) }).from(lessonMaterials).where(eq(lessonMaterials.lessonId, lessonId));
  return (row?.value ?? 0) + 1;
}

export async function insertLessonMaterial(input: {
  lessonId: string;
  mediaId: string;
  label: string;
  position: number;
}): Promise<LessonMaterialRecord> {
  const [row] = await db
    .insert(lessonMaterials)
    .values({
      lessonId: input.lessonId,
      mediaId: input.mediaId,
      label: input.label,
      position: input.position,
    })
    .returning();

  return row as LessonMaterialRecord;
}
