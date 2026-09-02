import { describe, expect, it } from "vitest";
import { markTextRead } from "../../progress/mark-text-read/service";
import { submitQuizAttempt } from "../../progress/submit-quiz-attempt/service";
import {
  seedCourse,
  seedEnrollment,
  seedLessonRequirements,
  seedLessons,
  seedQuizQuestion,
  seedUser,
} from "../../../test-support/academy-seed";
import { completionStatsByCourse } from "./store";

// A SQL de completionStatsByCourse replica isComplete (shared/lesson-chain.ts) num agregado só —
// só um banco real garante que a query não tem erro de sintaxe / de lógica.
describe("completionStatsByCourse (integração)", () => {
  it("conta pares (aluno, aula) concluídos e alunos que fecharam o curso, pela regra do lock-chain", async () => {
    const teacher = await seedUser();
    const student1 = await seedUser();
    const student2 = await seedUser();
    const course = await seedCourse(teacher.id);
    const [lesson1, lesson2] = await seedLessons(course.id, 2, teacher.id);

    await seedLessonRequirements(lesson1.id, teacher.id, { readTextEnabled: true });
    await seedLessonRequirements(lesson2.id, teacher.id, {
      readTextEnabled: true,
      quizEnabled: true,
      quizPassThresholdPercent: 50,
      quizMaxAttempts: 3,
    });
    const question = await seedQuizQuestion(lesson2.id, teacher.id, { correctOptionIndex: 0 });

    await seedEnrollment(course.id, student1.id, teacher.id);
    await seedEnrollment(course.id, student2.id, teacher.id);

    // student1 fecha as duas aulas → conclui o curso.
    await markTextRead({ lessonId: lesson1.id, actorId: student1.id });
    await markTextRead({ lessonId: lesson2.id, actorId: student1.id });
    await submitQuizAttempt({
      lessonId: lesson2.id,
      answers: [{ questionId: question.id, selectedOptionIndex: question.correctOptionIndex }],
      actorId: student1.id,
    });

    // student2 só fecha a aula 1.
    await markTextRead({ lessonId: lesson1.id, actorId: student2.id });

    const stats = (await completionStatsByCourse()).find((row) => row.courseId === course.id);

    expect(stats).toEqual({
      courseId: course.id,
      totalLessonPairs: 4, // 2 alunos × 2 aulas
      doneLessonPairs: 3, // student1: 2 · student2: 1
      completedStudents: 1, // só student1
      enrolledStudents: 2,
    });
  });
});
