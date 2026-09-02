import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { updateLessonSectionService } from "./service";
import type { UpdateLessonSectionInput, UpdateLessonSectionResult } from "./types";

export async function updateLessonSectionHandler(
  input: UpdateLessonSectionInput,
): Promise<UpdateLessonSectionResult> {
  if (input.id.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.lesson_sections.invalid_id", message: "id não pode ser vazio." },
    };
  }

  if (input.title !== undefined && input.title.trim().length === 0) {
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

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateLessonSectionService({ ...input, actorId: authz.actorId });
}
