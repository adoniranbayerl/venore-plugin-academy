import { count, eq, inArray, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { courses, lessonRequirements, lessons, quizQuestions } from "../../../database/schema";
import type { CourseRecord } from "../../../contracts/types";
import type { PublishCourseTargetStatus } from "./types";

export async function findCourseById(id: string): Promise<CourseRecord | null> {
  const [row] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return (row as CourseRecord) ?? null;
}

export async function markCoursePublished(id: string, status: PublishCourseTargetStatus): Promise<CourseRecord> {
  const [row] = await db
    .update(courses)
    .set({ status, updatedAt: sql`now()` })
    .where(eq(courses.id, id))
    .returning();

  return row as CourseRecord;
}

export type LessonWithQuizFlag = { id: string; position: number; quizEnabled: boolean };

// Left join: aula sem lesson_requirements configurado ainda conta pra validação de publish, com
// quizEnabled tratado como false (mesma leitura default do resto do plugin).
export async function findLessonsWithQuizFlagByCourse(courseId: string): Promise<LessonWithQuizFlag[]> {
  const rows = await db
    .select({
      id: lessons.id,
      position: lessons.position,
      quizEnabled: lessonRequirements.quizEnabled,
    })
    .from(lessons)
    .leftJoin(lessonRequirements, eq(lessonRequirements.lessonId, lessons.id))
    .where(eq(lessons.courseId, courseId))
    .orderBy(lessons.position);

  return rows.map((row) => ({ ...row, quizEnabled: row.quizEnabled ?? false }));
}

export async function countQuizQuestionsByLessonIds(lessonIds: string[]): Promise<Map<string, number>> {
  if (lessonIds.length === 0) return new Map();

  const rows = await db
    .select({ lessonId: quizQuestions.lessonId, total: count() })
    .from(quizQuestions)
    .where(inArray(quizQuestions.lessonId, lessonIds))
    .groupBy(quizQuestions.lessonId);

  return new Map(rows.map((row) => [row.lessonId, Number(row.total)]));
}
