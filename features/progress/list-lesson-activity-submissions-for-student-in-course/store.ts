import { and, asc, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonActivities, lessonActivitySubmissions, lessons } from "../../../database/schema";
import type { LessonActivitySubmissionRecord } from "../../../contracts/types";

export type SubmissionWithLessonActivityRow = {
  submission: LessonActivitySubmissionRecord;
  lessonId: string;
  lessonTitle: string;
  lessonPosition: number;
  activityTitle: string;
  activityPosition: number;
};

// Join até courseId (lessonActivitySubmissions não sabe o próprio curso, só a atividade) —
// inner join de propósito: atividade sem entrega deste aluno simplesmente não aparece, não há
// nada pra corrigir ali ainda.
export async function findSubmissionsByStudentInCourse(
  courseId: string,
  studentActorId: string,
): Promise<SubmissionWithLessonActivityRow[]> {
  const rows = await db
    .select({
      submission: lessonActivitySubmissions,
      lessonId: lessons.id,
      lessonTitle: lessons.title,
      lessonPosition: lessons.position,
      activityTitle: lessonActivities.title,
      activityPosition: lessonActivities.position,
    })
    .from(lessonActivitySubmissions)
    .innerJoin(lessonActivities, eq(lessonActivitySubmissions.activityId, lessonActivities.id))
    .innerJoin(lessons, eq(lessonActivities.lessonId, lessons.id))
    .where(and(eq(lessons.courseId, courseId), eq(lessonActivitySubmissions.actorId, studentActorId)))
    .orderBy(asc(lessons.position), asc(lessonActivities.position));

  return rows.map((row) => ({ ...row, submission: row.submission as LessonActivitySubmissionRecord }));
}
