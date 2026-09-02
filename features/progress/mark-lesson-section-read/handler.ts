import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { markLessonSectionRead } from "./service";
import type { MarkLessonSectionReadInput, MarkLessonSectionReadResult } from "./types";

export async function markLessonSectionReadHandler(
  input: MarkLessonSectionReadInput,
): Promise<MarkLessonSectionReadResult> {
  if (input.sectionId.trim().length === 0) {
    return { success: false, error: { code: "academy.lesson_sections.invalid_id", message: "sectionId não pode ser vazio." } };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return markLessonSectionRead({ ...input, actorId: currentUser.data.id });
}
