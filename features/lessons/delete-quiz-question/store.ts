import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { quizAttempts, quizQuestions } from "../../../database/schema";
import type { QuizAttemptRecord, QuizQuestionRecord } from "../../../contracts/types";

export async function findQuizQuestionById(id: string): Promise<QuizQuestionRecord | null> {
  const [row] = await db.select().from(quizQuestions).where(eq(quizQuestions.id, id)).limit(1);
  return (row as QuizQuestionRecord) ?? null;
}

export async function findQuizAttemptsByLesson(lessonId: string): Promise<QuizAttemptRecord[]> {
  const rows = await db.select().from(quizAttempts).where(eq(quizAttempts.lessonId, lessonId));
  return rows as QuizAttemptRecord[];
}

export async function deleteQuizQuestion(id: string): Promise<void> {
  await db.delete(quizQuestions).where(eq(quizQuestions.id, id));
}
