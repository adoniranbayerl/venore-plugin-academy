import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { quizQuestions } from "../../../database/schema";
import type { QuizQuestionRecord } from "../../../contracts/types";

export async function findQuizQuestionsByLesson(lessonId: string): Promise<QuizQuestionRecord[]> {
  const rows = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.lessonId, lessonId))
    .orderBy(quizQuestions.createdAt);
  return rows as QuizQuestionRecord[];
}
