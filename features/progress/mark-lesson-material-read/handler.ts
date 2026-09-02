import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { markLessonMaterialRead } from "./service";
import type { MarkLessonMaterialReadInput, MarkLessonMaterialReadResult } from "./types";

export async function markLessonMaterialReadHandler(
  input: MarkLessonMaterialReadInput,
): Promise<MarkLessonMaterialReadResult> {
  if (input.materialId.trim().length === 0) {
    return { success: false, error: { code: "academy.lesson_materials.invalid_id", message: "materialId não pode ser vazio." } };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return markLessonMaterialRead({ ...input, actorId: currentUser.data.id });
}
