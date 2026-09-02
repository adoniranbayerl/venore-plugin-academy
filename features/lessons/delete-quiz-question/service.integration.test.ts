import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "@venore/plugin-sdk";
import { quizQuestions } from "../../../database/schema";
import {
  seedCourse,
  seedEnrollment,
  seedLessonRequirements,
  seedLessons,
  seedQuizAttempt,
  seedQuizQuestion,
  seedUser,
} from "@venore/plugin-sdk/testing";
import { deleteQuizQuestionService } from "./service";

describe("deleteQuizQuestionService (integração)", () => {
  it("recusa apagar uma pergunta já respondida numa tentativa de aluno", async () => {
    const teacher = await seedUser();
    const student = await seedUser();
    const course = await seedCourse(teacher.id);
    const [lesson] = await seedLessons(course.id, 1, teacher.id);
    await seedLessonRequirements(lesson.id, teacher.id, {
      quizEnabled: true,
      quizPassThresholdPercent: 50,
      quizMaxAttempts: 3,
    });
    const question = await seedQuizQuestion(lesson.id, teacher.id, { correctOptionIndex: 0 });
    await seedEnrollment(course.id, student.id, teacher.id);

    const attempt = await seedQuizAttempt(lesson.id, student.id, [question]);
    expect(attempt.success).toBe(true);

    const result = await deleteQuizQuestionService({ id: question.id, actorId: teacher.id });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.quiz.cannot_delete_has_attempts", message: expect.any(String) },
    });

    const [row] = await db.select().from(quizQuestions).where(eq(quizQuestions.id, question.id)).limit(1);
    expect(row).toBeDefined();
  });
});
