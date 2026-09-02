import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { markVideoWatched } from "./service";
import type { MarkVideoWatchedInput, MarkVideoWatchedResult } from "./types";

export async function markVideoWatchedHandler(input: MarkVideoWatchedInput): Promise<MarkVideoWatchedResult> {
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

  return markVideoWatched({ ...input, actorId: currentUser.data.id });
}
