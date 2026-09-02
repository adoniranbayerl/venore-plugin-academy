import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessons, quizQuestions } from "../../../database/schema";
import type { LessonRecord, QuizQuestionRecord } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

export async function findQuizQuestionsByLesson(lessonId: string): Promise<QuizQuestionRecord[]> {
  const rows = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.lessonId, lessonId))
    .orderBy(quizQuestions.createdAt);
  return rows as QuizQuestionRecord[];
}
