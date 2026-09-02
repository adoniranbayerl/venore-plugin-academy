import { asc, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "@venore/plugin-sdk";
import { lessons } from "../../../database/schema";
import {
  seedCourse,
  seedEnrollment,
  seedLessonRequirements,
  seedLessons,
  seedTextRead,
  seedUser,
} from "../../../test-support/academy-seed";
import { deleteLessonService } from "./service";

describe("deleteLessonService (integração)", () => {
  it("recusa apagar uma aula com progresso de aluno registrado, e a aula continua no banco", async () => {
    const teacher = await seedUser();
    const student = await seedUser();
    const course = await seedCourse(teacher.id);
    const [lesson] = await seedLessons(course.id, 1, teacher.id);
    await seedLessonRequirements(lesson.id, teacher.id, { readTextEnabled: true });
    await seedEnrollment(course.id, student.id, teacher.id);
    await seedTextRead(lesson.id, student.id);

    const result = await deleteLessonService({ id: lesson.id, actorId: teacher.id });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lessons.cannot_delete_has_progress", message: expect.any(String) },
    });

    const [row] = await db.select().from(lessons).where(eq(lessons.id, lesson.id)).limit(1);
    expect(row).toBeDefined();
  });

  it("apaga uma aula sem progresso e renumera as posições seguintes sem deixar buraco", async () => {
    const teacher = await seedUser();
    const course = await seedCourse(teacher.id);
    const seeded = await seedLessons(course.id, 4, teacher.id);
    const [, second] = seeded;

    const result = await deleteLessonService({ id: second.id, actorId: teacher.id });
    expect(result.success).toBe(true);

    const remaining = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, course.id))
      .orderBy(asc(lessons.position));

    expect(remaining).toHaveLength(3);
    expect(remaining.map((row) => row.position)).toEqual([1, 2, 3]);
    expect(remaining.find((row) => row.id === second.id)).toBeUndefined();
  });
});
