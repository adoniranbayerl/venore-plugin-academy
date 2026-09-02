import { describe, expect, it } from "vitest";
import { markTextRead } from "../features/progress/mark-text-read/service";
import { markVideoWatched } from "../features/progress/mark-video-watched/service";
import { submitQuizAttempt } from "../features/progress/submit-quiz-attempt/service";
import { seedCourse, seedEnrollment, seedLessonRequirements, seedLessons, seedQuizQuestion, seedUser } from "../test-support/academy-seed";

// Teste de segurança ponta a ponta contra banco real: hoje isLessonAccessible (fronteira usada
// por mark-text-read, mark-video-watched e submit-quiz-attempt) só é exercitada com a função
// pura (lesson-chain.test.ts) ou com store mockada — nunca com o carregamento real em lote
// (lesson-chain-store.ts) contra dados de verdade.
describe("cadeia de bloqueio de aulas (integração)", () => {
  it("bloqueia a aula 3 até a cadeia ser satisfeita em ordem, e libera depois", async () => {
    const teacher = await seedUser();
    const student = await seedUser();
    const course = await seedCourse(teacher.id);
    const [lesson1, lesson2, lesson3] = await seedLessons(course.id, 3, teacher.id);

    await seedLessonRequirements(lesson1.id, teacher.id, { readTextEnabled: true });
    await seedLessonRequirements(lesson2.id, teacher.id, { watchVideoEnabled: true });
    await seedLessonRequirements(lesson3.id, teacher.id, {
      readTextEnabled: true,
      quizEnabled: true,
      quizPassThresholdPercent: 50,
      quizMaxAttempts: 3,
    });
    const question = await seedQuizQuestion(lesson3.id, teacher.id, { correctOptionIndex: 0 });

    await seedEnrollment(course.id, student.id, teacher.id);

    // Aluno sem nenhum progresso: aula 3 recusada nos dois requisitos que ela exige.
    const quizBeforeAnyProgress = await submitQuizAttempt({
      lessonId: lesson3.id,
      answers: [{ questionId: question.id, selectedOptionIndex: question.correctOptionIndex }],
      actorId: student.id,
    });
    expect(quizBeforeAnyProgress).toEqual({
      success: false,
      error: { code: "academy.progress.lesson_locked", message: expect.any(String) },
    });

    const textReadBeforeAnyProgress = await markTextRead({ lessonId: lesson3.id, actorId: student.id });
    expect(textReadBeforeAnyProgress).toEqual({
      success: false,
      error: { code: "academy.progress.lesson_locked", message: expect.any(String) },
    });

    // Completa só a aula 1 — aula 3 continua bloqueada porque a aula 2 (predecessora imediata)
    // ainda não foi satisfeita.
    const lesson1Result = await markTextRead({ lessonId: lesson1.id, actorId: student.id });
    expect(lesson1Result.success).toBe(true);

    const quizAfterLesson1Only = await submitQuizAttempt({
      lessonId: lesson3.id,
      answers: [{ questionId: question.id, selectedOptionIndex: question.correctOptionIndex }],
      actorId: student.id,
    });
    expect(quizAfterLesson1Only).toEqual({
      success: false,
      error: { code: "academy.progress.lesson_locked", message: expect.any(String) },
    });

    // Completa a aula 2 — a cadeia inteira até a aula 3 está satisfeita agora.
    const lesson2Result = await markVideoWatched({ lessonId: lesson2.id, actorId: student.id });
    expect(lesson2Result.success).toBe(true);

    const textReadAfterChainSatisfied = await markTextRead({ lessonId: lesson3.id, actorId: student.id });
    expect(textReadAfterChainSatisfied.success).toBe(true);

    const quizAfterChainSatisfied = await submitQuizAttempt({
      lessonId: lesson3.id,
      answers: [{ questionId: question.id, selectedOptionIndex: question.correctOptionIndex }],
      actorId: student.id,
    });
    expect(quizAfterChainSatisfied.success).toBe(true);
    if (quizAfterChainSatisfied.success) {
      expect(quizAfterChainSatisfied.data.passed).toBe(true);
    }
  });
});
