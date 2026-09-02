import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { createLesson } from "./service";
import type { CreateLessonInput, CreateLessonResult } from "./types";

export async function createLessonHandler(input: CreateLessonInput): Promise<CreateLessonResult> {
  if (input.courseId.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_course_id", message: "courseId não pode ser vazio." } };
  }

  if (input.title.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_title", message: "title não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createLesson({ ...input, actorId: authz.actorId });
}
