import { getEntry } from "@venore/plugin-sdk/cms";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { findSectionByCmsEntryId, findSectionById, updateSection } from "./store";
import type { UpdateLessonSectionCommand, UpdateLessonSectionResult } from "./types";

export async function updateLessonSectionService(
  command: UpdateLessonSectionCommand,
): Promise<UpdateLessonSectionResult> {
  const handle = beginOperation({
    useCase: "academy.update-lesson-section",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findSectionById(command.id);
  if (!existing) {
    const error = {
      code: "academy.lesson_sections.not_found",
      message: `Lesson section "${command.id}" não encontrada.`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  if (command.cmsEntryId !== undefined && command.cmsEntryId !== existing.cmsEntryId) {
    const entry = await getEntry({ id: command.cmsEntryId });
    if (!entry.success || !entry.data) {
      const error = {
        code: "academy.lesson_sections.invalid_cms_entry",
        message: `Nenhuma entry publicada encontrada com id "${command.cmsEntryId}".`,
      };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }

    const conflictingSection = await findSectionByCmsEntryId(command.cmsEntryId, command.id);
    if (conflictingSection) {
      const error = {
        code: "academy.lesson_sections.cms_entry_already_in_use",
        message: `A entry "${command.cmsEntryId}" já está em uso por outra seção.`,
      };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }
  }

  const section = await updateSection(command.id, {
    title: command.title,
    cmsEntryId: command.cmsEntryId,
    videoUrl: command.videoUrl,
  });

  endOperation(handle, { success: true });
  return { success: true, data: section };
}
