import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { getMessageThread } from "./service";
import type { GetMessageThreadInput, GetMessageThreadResult } from "./types";

export async function getMessageThreadHandler(input: GetMessageThreadInput): Promise<GetMessageThreadResult> {
  if (input.lessonId.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_id", message: "lessonId não pode ser vazio." } };
  }
  if (input.stepKey.trim().length === 0) {
    return { success: false, error: { code: "academy.messages.invalid_step_key", message: "stepKey não pode ser vazio." } };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return getMessageThread({ ...input, actorId: currentUser.data.id });
}
