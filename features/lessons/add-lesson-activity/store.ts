import { eq, max } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonActivities, lessons } from "../../../database/schema";
import type { LessonActivityRecord, LessonRecord } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

// max(position)+1, não count()+1 — count() colide quando uma atividade do meio da sequência já
// foi excluída (mesmo bug de posição corrigido em add-lesson-example/store.ts nesta sessão).
export async function findNextActivityPosition(lessonId: string): Promise<number> {
  const [row] = await db.select({ value: max(lessonActivities.position) }).from(lessonActivities).where(eq(lessonActivities.lessonId, lessonId));
  return (row?.value ?? 0) + 1;
}

export async function insertLessonActivity(input: {
  lessonId: string;
  title: string;
  instructionsText: string;
  deliverableFormat: string;
  position: number;
}): Promise<LessonActivityRecord> {
  const [row] = await db
    .insert(lessonActivities)
    .values({
      lessonId: input.lessonId,
      title: input.title,
      instructionsText: input.instructionsText,
      deliverableFormat: input.deliverableFormat,
      position: input.position,
    })
    .returning();

  return row as LessonActivityRecord;
}
