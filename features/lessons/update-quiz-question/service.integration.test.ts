import { describe, expect, it } from "vitest";
import { seedCourse, seedLessons, seedQuizQuestion, seedUser } from "@venore/plugin-sdk/testing";
import { updateQuizQuestionService } from "./service";

describe("updateQuizQuestionService (integração)", () => {
  it("atualiza texto e opções, persistindo no banco", async () => {
    const teacher = await seedUser();
    const course = await seedCourse(teacher.id);
    const [lesson] = await seedLessons(course.id, 1, teacher.id);
    const question = await seedQuizQuestion(lesson.id, teacher.id, { options: ["A", "B", "C"], correctOptionIndex: 0 });

    const result = await updateQuizQuestionService({
      id: question.id,
      text: "Pergunta revisada?",
      options: ["X", "Y"],
      correctOptionIndex: 1,
      actorId: teacher.id,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.text).toBe("Pergunta revisada?");
      expect(result.data.options).toEqual(["X", "Y"]);
      expect(result.data.correctOptionIndex).toBe(1);
    }
  });

  it("recusa um correctOptionIndex fora do range das opções finais", async () => {
    const teacher = await seedUser();
    const course = await seedCourse(teacher.id);
    const [lesson] = await seedLessons(course.id, 1, teacher.id);
    const question = await seedQuizQuestion(lesson.id, teacher.id, { options: ["A", "B"], correctOptionIndex: 1 });

    // Não reenvia correctOptionIndex: o service usa o existente (1), que passa a ser inválido
    // pra uma lista de opções com um único item.
    const result = await updateQuizQuestionService({ id: question.id, options: ["A"], actorId: teacher.id });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.quiz.invalid_correct_option", message: expect.any(String) },
    });
  });
});
