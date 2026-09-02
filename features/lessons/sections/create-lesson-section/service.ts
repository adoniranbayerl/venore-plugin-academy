import { getEntry } from "@venore/plugin-sdk/cms";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { findLessonById, findNextPosition, findSectionByCmsEntryId, insertSection } from "./store";
import type { CreateLessonSectionCommand, CreateLessonSectionResult } from "./types";

export async function createLessonSectionService(
  command: CreateLessonSectionCommand,
): Promise<CreateLessonSectionResult> {
  const handle = beginOperation({
    useCase: "academy.create-lesson-section",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const lesson = await findLessonById(command.lessonId);
  if (!lesson) {
    const error = {
      code: "academy.lesson_sections.lesson_not_found",
      message: `Lesson "${command.lessonId}" não encontrada.`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  if (command.cmsEntryId !== undefined) {
    const entry = await getEntry({ id: command.cmsEntryId });
    if (!entry.success || !entry.data) {
      const error = {
        code: "academy.lesson_sections.invalid_cms_entry",
        message: `Nenhuma entry publicada encontrada com id "${command.cmsEntryId}".`,
      };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }

    // Uma cms entry só pode estar anexada a uma seção por vez — reutilizá-la em outra aula (ou
    // em outra seção da mesma aula) criaria duas abas mostrando o mesmo conteúdo sem nenhum
    // propósito, então é tratado como referência inválida.
    const existingSection = await findSectionByCmsEntryId(command.cmsEntryId);
    if (existingSection) {
      const error = {
        code: "academy.lesson_sections.cms_entry_already_in_use",
        message: `A entry "${command.cmsEntryId}" já está em uso por outra seção.`,
      };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }
  }

  const position = await findNextPosition(command.lessonId);
  const section = await insertSection({
    lessonId: command.lessonId,
    title: command.title,
    cmsEntryId: command.cmsEntryId,
    videoUrl: command.videoUrl,
    position,
  });

  endOperation(handle, { success: true });
  return { success: true, data: section };
}
