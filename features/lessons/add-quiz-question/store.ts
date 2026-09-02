import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessons, quizQuestions } from "../../../database/schema";
import type { LessonRecord, QuizQuestionKind, QuizQuestionRecord } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

export async function insertQuizQuestion(input: {
  lessonId: string;
  text: string;
  options: string[];
  optionNotations: (string | null)[] | null;
  correctOptionIndex: number;
  questionKind: QuizQuestionKind;
  promptNotation: string | null;
}): Promise<QuizQuestionRecord> {
  const [row] = await db
    .insert(quizQuestions)
    .values({
      lessonId: input.lessonId,
      text: input.text,
      options: input.options,
      optionNotations: input.optionNotations,
      correctOptionIndex: input.correctOptionIndex,
      questionKind: input.questionKind,
      promptNotation: input.promptNotation,
    })
    .returning();

  return row as QuizQuestionRecord;
}
