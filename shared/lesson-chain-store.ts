import { and, eq, inArray, isNull, ne } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import {
  lessonActivities,
  lessonActivitySubmissions,
  lessonRequirements,
  lessonTextCompletions,
  lessonVideoCompletions,
  lessons,
  quizAttempts,
} from "../database/schema";
import type { LessonRecord, LessonRequirementsRecord, QuizAttemptRecord } from "../contracts/types";

export type LessonChainRawData = {
  lessons: LessonRecord[];
  requirementsByLessonId: Map<string, LessonRequirementsRecord | null>;
  textCompletedLessonIds: Set<string>;
  videoCompletedLessonIds: Set<string>;
  attemptsByLessonId: Map<string, QuizAttemptRecord[]>;
  activityIdsByLessonId: Map<string, string[]>;
  submittedActivityIds: Set<string>;
};

// Conjunto fixo de queries: 1 pra pegar as aulas do curso + 5 em paralelo filtradas por
// lessonId IN (...), mais 1 dependente (submissões, filtrada pelos activityId apurados na query
// de atividades) — sempre 7 queries, independente de quantas aulas o curso tem ou da posição da
// aula sendo autorizada. Antes, isLessonAccessible fazia round-trip sequencial por aula
// (~4 queries * posição da aula).
export async function loadLessonChainRawData(courseId: string, actorId: string): Promise<LessonChainRawData> {
  // Aula "draft" fica fora da cadeia inteira (progresso, trilha, lock-chain) — ainda sendo
  // escrita, não deve contar posição nem travar a aula seguinte (ver contracts/types.ts,
  // LessonStatus). "restricted"/"public" entram igual — a única diferença entre as duas é o
  // bypass de matrícula na página da aula (AcademyLessonPage), não a trilha em si.
  const lessonRows = (await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.courseId, courseId), ne(lessons.status, "draft")))
    .orderBy(lessons.position)) as LessonRecord[];

  if (lessonRows.length === 0) {
    return {
      lessons: [],
      requirementsByLessonId: new Map(),
      textCompletedLessonIds: new Set(),
      videoCompletedLessonIds: new Set(),
      attemptsByLessonId: new Map(),
      activityIdsByLessonId: new Map(),
      submittedActivityIds: new Set(),
    };
  }

  const lessonIds = lessonRows.map((lesson) => lesson.id);

  const [requirementRows, textRows, videoRows, attemptRows, activityRows] = await Promise.all([
    db.select().from(lessonRequirements).where(inArray(lessonRequirements.lessonId, lessonIds)),
    db
      .select({ lessonId: lessonTextCompletions.lessonId })
      .from(lessonTextCompletions)
      .where(and(inArray(lessonTextCompletions.lessonId, lessonIds), eq(lessonTextCompletions.actorId, actorId))),
    db
      .select({ lessonId: lessonVideoCompletions.lessonId })
      .from(lessonVideoCompletions)
      .where(and(inArray(lessonVideoCompletions.lessonId, lessonIds), eq(lessonVideoCompletions.actorId, actorId))),
    db
      .select()
      .from(quizAttempts)
      .where(and(inArray(quizAttempts.lessonId, lessonIds), eq(quizAttempts.actorId, actorId), isNull(quizAttempts.invalidatedAt))),
    db
      .select({ id: lessonActivities.id, lessonId: lessonActivities.lessonId })
      .from(lessonActivities)
      .where(inArray(lessonActivities.lessonId, lessonIds)),
  ]);

  const requirementsByLessonId = new Map<string, LessonRequirementsRecord | null>(lessonIds.map((id) => [id, null]));
  for (const row of requirementRows as LessonRequirementsRecord[]) {
    requirementsByLessonId.set(row.lessonId, row);
  }

  const attemptsByLessonId = new Map<string, QuizAttemptRecord[]>();
  for (const attempt of attemptRows as QuizAttemptRecord[]) {
    const existing = attemptsByLessonId.get(attempt.lessonId) ?? [];
    existing.push(attempt);
    attemptsByLessonId.set(attempt.lessonId, existing);
  }

  const activityIdsByLessonId = new Map<string, string[]>();
  for (const row of activityRows) {
    const existing = activityIdsByLessonId.get(row.lessonId) ?? [];
    existing.push(row.id);
    activityIdsByLessonId.set(row.lessonId, existing);
  }

  const activityIds = activityRows.map((row) => row.id);
  // Dependente da query anterior (precisa da lista de activityId) — não dá pra entrar no
  // Promise.all acima. "needs_revision"/"rejected" não contam como satisfeito (ver comentário de
  // activityEnabled em database/schema/index.ts): professor pediu reenvio ou reprovou, trilha
  // volta a travar até o aluno reenviar (submit-lesson-activity reseta reviewStatus pra "pending").
  const submissionRows =
    activityIds.length === 0
      ? []
      : await db
          .select({ activityId: lessonActivitySubmissions.activityId })
          .from(lessonActivitySubmissions)
          .where(
            and(
              inArray(lessonActivitySubmissions.activityId, activityIds),
              eq(lessonActivitySubmissions.actorId, actorId),
              ne(lessonActivitySubmissions.reviewStatus, "needs_revision"),
              ne(lessonActivitySubmissions.reviewStatus, "rejected"),
            ),
          );

  return {
    lessons: lessonRows,
    requirementsByLessonId,
    textCompletedLessonIds: new Set(textRows.map((row) => row.lessonId)),
    videoCompletedLessonIds: new Set(videoRows.map((row) => row.lessonId)),
    attemptsByLessonId,
    activityIdsByLessonId,
    submittedActivityIds: new Set(submissionRows.map((row) => row.activityId)),
  };
}
