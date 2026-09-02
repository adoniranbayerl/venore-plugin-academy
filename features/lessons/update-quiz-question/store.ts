import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { quizQuestions } from "../../../database/schema";
import type { QuizQuestionKind, QuizQuestionRecord } from "../../../contracts/types";

export async function findQuizQuestionById(id: string): Promise<QuizQuestionRecord | null> {
  const [row] = await db.select().from(quizQuestions).where(eq(quizQuestions.id, id)).limit(1);
  return (row as QuizQuestionRecord) ?? null;
}

export async function updateQuizQuestion(
  id: string,
  input: {
    text?: string;
    options?: string[];
    optionNotations?: (string | null)[] | null;
    correctOptionIndex?: number;
    questionKind?: QuizQuestionKind;
    promptNotation?: string | null;
  },
): Promise<QuizQuestionRecord> {
  const [row] = await db.update(quizQuestions).set(input).where(eq(quizQuestions.id, id)).returning();
  return row as QuizQuestionRecord;
}
