import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessons, quizAttempts, quizQuestions } from "../../../database/schema";
import type { LessonRecord, QuizAnswer, QuizAttemptRecord, QuizQuestionRecord } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

export async function findQuestionsByLesson(lessonId: string): Promise<QuizQuestionRecord[]> {
  const rows = await db.select().from(quizQuestions).where(eq(quizQuestions.lessonId, lessonId));
  return rows as QuizQuestionRecord[];
}

export async function insertAttempt(input: {
  lessonId: string;
  actorId: string;
  attemptNumber: number;
  score: number;
  passed: boolean;
  answers: QuizAnswer[];
}): Promise<QuizAttemptRecord> {
  const [row] = await db
    .insert(quizAttempts)
    .values({
      lessonId: input.lessonId,
      actorId: input.actorId,
      attemptNumber: input.attemptNumber,
      score: input.score,
      passed: input.passed,
      answers: input.answers,
    })
    .returning();

  return row as QuizAttemptRecord;
}
