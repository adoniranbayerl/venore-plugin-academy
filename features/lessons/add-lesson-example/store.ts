import { eq, max } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonExamples, lessons } from "../../../database/schema";
import type { LessonExampleRecord, LessonRecord } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

// max(position)+1, não count()+1 — count() colide quando um exemplo do meio da sequência já foi
// excluído (bug reportado nesta sessão: excluir a posição 1 e adicionar de novo tentava reusar a
// posição 2, que o exemplo restante já ocupava). Posição nunca é reaproveitada.
export async function findNextExamplePosition(lessonId: string): Promise<number> {
  const [row] = await db.select({ value: max(lessonExamples.position) }).from(lessonExamples).where(eq(lessonExamples.lessonId, lessonId));
  return (row?.value ?? 0) + 1;
}

export async function insertLessonExample(input: {
  lessonId: string;
  title: string;
  audioMediaId: string | null;
  sheetMediaId: string | null;
  notationData: string | null;
  captionText: string;
  position: number;
}): Promise<LessonExampleRecord> {
  const [row] = await db
    .insert(lessonExamples)
    .values({
      lessonId: input.lessonId,
      title: input.title,
      audioMediaId: input.audioMediaId,
      sheetMediaId: input.sheetMediaId,
      notationData: input.notationData,
      captionText: input.captionText,
      position: input.position,
    })
    .returning();

  return row as LessonExampleRecord;
}
