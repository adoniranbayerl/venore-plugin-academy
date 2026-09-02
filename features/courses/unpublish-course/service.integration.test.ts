import { describe, expect, it } from "vitest";
import { seedCourse, seedLessons, seedUser } from "@venore/plugin-sdk/testing";
import { publishCourse } from "../publish-course/service";
import { unpublishCourse } from "./service";

describe("unpublishCourse (integração)", () => {
  it("volta um curso publicado para draft", async () => {
    const teacher = await seedUser();
    const course = await seedCourse(teacher.id);
    await seedLessons(course.id, 1, teacher.id);
    const published = await publishCourse({ id: course.id, status: "public", actorId: teacher.id });
    expect(published.success).toBe(true);

    const result = await unpublishCourse({ id: course.id, actorId: teacher.id });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("draft");
    }
  });

  it("recusa um curso inexistente", async () => {
    const teacher = await seedUser();

    const result = await unpublishCourse({ id: "does-not-exist", actorId: teacher.id });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.courses.not_found", message: expect.any(String) },
    });
  });
});
