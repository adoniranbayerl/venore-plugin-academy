import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { sendTeacherMessage } from "./service";
import type { SendTeacherMessageInput, SendTeacherMessageResult } from "./types";

export async function sendTeacherMessageHandler(input: SendTeacherMessageInput): Promise<SendTeacherMessageResult> {
  if (input.lessonId.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_id", message: "lessonId não pode ser vazio." } };
  }
  if (input.stepKey.trim().length === 0) {
    return { success: false, error: { code: "academy.messages.invalid_step_key", message: "stepKey não pode ser vazio." } };
  }
  if (input.studentActorId.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.progress.invalid_student_id", message: "studentActorId não pode ser vazio." },
    };
  }
  if (input.type !== undefined && input.type !== "question" && input.type !== "correction") {
    return {
      success: false,
      error: { code: "academy.messages.invalid_type", message: 'type precisa ser "question" ou "correction".' },
    };
  }
  if (input.body.trim().length === 0) {
    return { success: false, error: { code: "academy.messages.empty_body", message: "A mensagem não pode ser vazia." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return sendTeacherMessage({ ...input, actorId: authz.actorId });
}
