import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { markTextRead } from "./service";
import type { MarkTextReadInput, MarkTextReadResult } from "./types";

export async function markTextReadHandler(input: MarkTextReadInput): Promise<MarkTextReadResult> {
  if (input.lessonId.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_id", message: "lessonId não pode ser vazio." } };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return markTextRead({ ...input, actorId: currentUser.data.id });
}
