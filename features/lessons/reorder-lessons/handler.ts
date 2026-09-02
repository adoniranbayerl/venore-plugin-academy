import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { reorderLessonsService } from "./service";
import type { ReorderLessonsInput, ReorderLessonsResult } from "./types";

export async function reorderLessonsHandler(input: ReorderLessonsInput): Promise<ReorderLessonsResult> {
  if (input.courseId.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_course_id", message: "courseId não pode ser vazio." } };
  }

  if (input.lessonIds.length === 0) {
    return {
      success: false,
      error: { code: "academy.lessons.invalid_lesson_ids", message: "lessonIds não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return reorderLessonsService({ ...input, actorId: authz.actorId });
}
