import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonActivities, lessonActivitySubmissions, lessons } from "../../../database/schema";
import type { LessonActivityRecord, LessonActivitySubmissionRecord, LessonRecord } from "../../../contracts/types";

export async function findLessonActivityById(id: string): Promise<LessonActivityRecord | null> {
  const [row] = await db.select().from(lessonActivities).where(eq(lessonActivities.id, id)).limit(1);
  return (row as LessonActivityRecord) ?? null;
}

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

// Reenvio sobrescreve a entrega anterior e reseta a revisão (ver comentário de
// lessonActivitySubmissions em database/schema/index.ts) — um novo conteúdo entregue precisa de
// uma nova revisão, não pode herdar approved/needs_revision/reviewScore da entrega antiga.
// initialReviewStatus vem do service: "approved" pra deliverableFormat "none" (auto-suficiente,
// pedido desta sessão), "pending" pros demais.
export async function upsertLessonActivitySubmission(input: {
  activityId: string;
  actorId: string;
  contentText: string | null;
  mediaId: string | null;
  initialReviewStatus: "pending" | "approved";
}): Promise<LessonActivitySubmissionRecord> {
  const values = {
    activityId: input.activityId,
    actorId: input.actorId,
    contentText: input.contentText,
    mediaId: input.mediaId,
    reviewStatus: input.initialReviewStatus,
    reviewFeedback: null,
    reviewScore: null,
    reviewedBy: null,
    reviewedAt: null,
    reviewSeenAt: null,
    submittedAt: new Date(),
  };

  const [row] = await db
    .insert(lessonActivitySubmissions)
    .values(values)
    .onConflictDoUpdate({
      target: [lessonActivitySubmissions.activityId, lessonActivitySubmissions.actorId],
      set: values,
    })
    .returning();

  return row as LessonActivitySubmissionRecord;
}
