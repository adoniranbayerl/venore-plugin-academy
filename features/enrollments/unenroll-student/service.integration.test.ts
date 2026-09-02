import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "@venore/plugin-sdk";
import { enrollments } from "../../../database/schema";
import { seedCourse, seedEnrollment, seedUser } from "@venore/plugin-sdk/testing";
import { unenrollStudent } from "./service";

describe("unenrollStudent (integração)", () => {
  it("remove a matrícula de um aluno matriculado", async () => {
    const teacher = await seedUser();
    const student = await seedUser();
    const course = await seedCourse(teacher.id);
    await seedEnrollment(course.id, student.id, teacher.id);

    const result = await unenrollStudent({ courseId: course.id, studentActorId: student.id, actorId: teacher.id });

    expect(result.success).toBe(true);

    const rows = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.courseId, course.id));
    expect(rows).toHaveLength(0);
  });

  it("recusa desmatricular um aluno que não está matriculado", async () => {
    const teacher = await seedUser();
    const student = await seedUser();
    const course = await seedCourse(teacher.id);

    const result = await unenrollStudent({ courseId: course.id, studentActorId: student.id, actorId: teacher.id });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.not_found", message: expect.any(String) },
    });
  });
});
