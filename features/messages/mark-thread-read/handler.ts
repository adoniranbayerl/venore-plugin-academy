import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { markThreadRead } from "./service";
import type { MarkThreadReadInput, MarkThreadReadResult } from "./types";

export async function markThreadReadHandler(input: MarkThreadReadInput): Promise<MarkThreadReadResult> {
  if (input.threadId.trim().length === 0) {
    return { success: false, error: { code: "academy.messages.invalid_thread_id", message: "threadId não pode ser vazio." } };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return markThreadRead({ ...input, actorId: currentUser.data.id });
}
