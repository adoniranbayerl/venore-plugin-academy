import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { createLessonSectionService } from "./service";
import type { CreateLessonSectionInput, CreateLessonSectionResult } from "./types";

export async function createLessonSectionHandler(
  input: CreateLessonSectionInput,
): Promise<CreateLessonSectionResult> {
  if (input.lessonId.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.lesson_sections.invalid_lesson_id", message: "lessonId não pode ser vazio." },
    };
  }

  if (input.title.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.lesson_sections.invalid_title", message: "title não pode ser vazio." },
    };
  }

  if (input.cmsEntryId !== undefined && input.cmsEntryId.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.lesson_sections.invalid_cms_entry_id", message: "cmsEntryId não pode ser vazio." },
    };
  }

  if (input.videoUrl !== undefined && input.videoUrl.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.lesson_sections.invalid_video_url", message: "videoUrl não pode ser vazio." },
    };
  }

  if (input.cmsEntryId === undefined && input.videoUrl === undefined) {
    return {
      success: false,
      error: {
        code: "academy.lesson_sections.missing_content",
        message: "A seção precisa de ao menos um entre cmsEntryId e videoUrl.",
      },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createLessonSectionService({ ...input, actorId: authz.actorId });
}
