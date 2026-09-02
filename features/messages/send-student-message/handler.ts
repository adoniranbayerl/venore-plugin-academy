import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { sendStudentMessage } from "./service";
import type { SendStudentMessageInput, SendStudentMessageResult } from "./types";

export async function sendStudentMessageHandler(input: SendStudentMessageInput): Promise<SendStudentMessageResult> {
  if (input.lessonId.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_id", message: "lessonId não pode ser vazio." } };
  }
  if (input.stepKey.trim().length === 0) {
    return { success: false, error: { code: "academy.messages.invalid_step_key", message: "stepKey não pode ser vazio." } };
  }
  if (input.type !== "question" && input.type !== "correction") {
    return {
      success: false,
      error: { code: "academy.messages.invalid_type", message: 'type precisa ser "question" ou "correction".' },
    };
  }
  if (input.body.trim().length === 0) {
    return { success: false, error: { code: "academy.messages.empty_body", message: "A mensagem não pode ser vazia." } };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return sendStudentMessage({ ...input, actorId: currentUser.data.id });
}
