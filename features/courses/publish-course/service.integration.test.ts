import { describe, expect, it } from "vitest";
import { seedCourse, seedLessonRequirements, seedLessons, seedUser } from "../../../test-support/academy-seed";
import { publishCourse } from "./service";

describe("publishCourse (integração)", () => {
  it("recusa um curso sem nenhuma aula", async () => {
    const teacher = await seedUser();
    const course = await seedCourse(teacher.id);

    const result = await publishCourse({ id: course.id, status: "public", actorId: teacher.id });

    expect(result).toEqual({
      success: false,
      error: {
        code: "academy.courses.publish_validation_failed",
        message: "O curso precisa de pelo menos uma aula.",
      },
    });
  });

  it("recusa uma aula com quiz habilitado sem nenhuma pergunta cadastrada", async () => {
    const teacher = await seedUser();
    const course = await seedCourse(teacher.id);

    const [lessonWithEmptyQuiz] = await seedLessons(course.id, 1, teacher.id);
    await seedLessonRequirements(lessonWithEmptyQuiz.id, teacher.id, {
      quizEnabled: true,
      quizPassThresholdPercent: 50,
      quizMaxAttempts: 3,
    });

    const result = await publishCourse({ id: course.id, status: "public", actorId: teacher.id });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("academy.courses.publish_validation_failed");
      expect(result.error.message).toContain("quiz habilitado sem nenhuma pergunta cadastrada");
    }
  });
});
