import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { createLessonTextSection } from "./service";
import type { CreateLessonTextSectionInput, CreateLessonTextSectionResult } from "./types";

export async function createLessonTextSectionHandler(
  input: CreateLessonTextSectionInput,
): Promise<CreateLessonTextSectionResult> {
  if (input.lessonId.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.lesson_sections.invalid_lesson_id", message: "lessonId não pode ser vazio." },
    };
  }

  if (input.title.trim().length === 0) {
    return { success: false, error: { code: "academy.lesson_sections.invalid_title", message: "title não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createLessonTextSection({ ...input, actorId: authz.actorId });
}
