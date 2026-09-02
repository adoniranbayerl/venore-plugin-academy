import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { courses, lessonActivities, lessonActivitySubmissions, lessons } from "../database/schema";

export type UnseenReviewedSubmission = {
  activityId: string;
  activityTitle: string;
  lessonId: string;
  lessonTitle: string;
  courseSlug: string;
  reviewStatus: string;
  reviewedAt: Date;
};

// Alimenta o alerta do header pro aluno (get-activity-review-alert) — toda entrega já revisada
// pelo professor (reviewedAt setado, ver review-lesson-activity-submission/store.ts) que o aluno
// ainda não viu (reviewSeenAt null, ver comentário em database/schema/index.ts). Ordenado por
// reviewedAt desc: a revisão mais recente é o destino do link do alerta, mesmo critério de
// findThreadsByStudent em lesson-messages-store.ts.
export async function findUnseenReviewedSubmissionsByStudent(studentActorId: string): Promise<UnseenReviewedSubmission[]> {
  const rows = await db
    .select({
      activityId: lessonActivitySubmissions.activityId,
      activityTitle: lessonActivities.title,
      lessonId: lessons.id,
      lessonTitle: lessons.title,
      courseSlug: courses.slug,
      reviewStatus: lessonActivitySubmissions.reviewStatus,
      reviewedAt: lessonActivitySubmissions.reviewedAt,
    })
    .from(lessonActivitySubmissions)
    .innerJoin(lessonActivities, eq(lessonActivitySubmissions.activityId, lessonActivities.id))
    .innerJoin(lessons, eq(lessonActivities.lessonId, lessons.id))
    .innerJoin(courses, eq(lessons.courseId, courses.id))
    .where(
      and(
        eq(lessonActivitySubmissions.actorId, studentActorId),
        isNotNull(lessonActivitySubmissions.reviewedAt),
        isNull(lessonActivitySubmissions.reviewSeenAt),
      ),
    )
    .orderBy(desc(lessonActivitySubmissions.reviewedAt));

  return rows.map((row) => ({ ...row, reviewedAt: row.reviewedAt as Date }));
}

// Disparado quando a etapa de atividade mostra pro próprio dono (actorId vem do usuário
// autenticado, nunca do client) a entrega já revisada — condição no WHERE garante idempotência
// (chamar de novo numa entrega já vista, ou ainda sem revisão nenhuma, é um no-op silencioso).
export async function markSubmissionReviewSeen(activityId: string, actorId: string): Promise<void> {
  await db
    .update(lessonActivitySubmissions)
    .set({ reviewSeenAt: new Date() })
    .where(
      and(
        eq(lessonActivitySubmissions.activityId, activityId),
        eq(lessonActivitySubmissions.actorId, actorId),
        isNotNull(lessonActivitySubmissions.reviewedAt),
        isNull(lessonActivitySubmissions.reviewSeenAt),
      ),
    );
}
