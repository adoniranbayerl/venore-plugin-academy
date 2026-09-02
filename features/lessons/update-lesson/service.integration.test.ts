import { describe, expect, it } from "vitest";
import { seedCourse, seedLessons, seedUser } from "@venore/plugin-sdk/testing";
import { updateLessonService } from "./service";

describe("updateLessonService (integração)", () => {
  it("troca o título e o corpo da aula", async () => {
    const teacher = await seedUser();
    const course = await seedCourse(teacher.id);
    const [lesson] = await seedLessons(course.id, 1, teacher.id);

    const result = await updateLessonService({
      id: lesson.id,
      title: "Novo título",
      body: "Novo conteúdo",
      actorId: teacher.id,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Novo título");
      expect(result.data.body).toBe("Novo conteúdo");
    }
  });

  it("recusa trocar para um coverMediaId que não existe", async () => {
    const teacher = await seedUser();
    const course = await seedCourse(teacher.id);
    const [lesson] = await seedLessons(course.id, 1, teacher.id);

    const result = await updateLessonService({ id: lesson.id, coverMediaId: "does-not-exist", actorId: teacher.id });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lessons.invalid_cover_media", message: expect.any(String) },
    });
  });
});
