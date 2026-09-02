import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { sendPushToActor } from "@venore/plugin-sdk/web-push";
import { isEnrolled } from "../../../shared/enrollment";
import { findLessonById, findOrCreateThread, insertMessage, isValidStepKey } from "./store";
import type { SendTeacherMessageCommand, SendTeacherMessageResult } from "./types";

// Diferente de sendStudentMessage: professor pode abrir uma conversa nova (correção sem pergunta
// prévia do aluno — ver comentário em types.ts) e não precisa de isLessonAccessible (regra de
// trilha é só pro aluno). Ainda confere que studentActorId é mesmo um aluno matriculado nesse
// curso, pra não criar conversa "órfã" com um id que não é ninguém.
export async function sendTeacherMessage(command: SendTeacherMessageCommand): Promise<SendTeacherMessageResult> {
  const handle = beginOperation({
    useCase: "academy.send-teacher-message",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const lesson = await findLessonById(command.lessonId);
  if (!lesson) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${command.lessonId}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const enrolled = await isEnrolled(lesson.courseId, command.studentActorId);
  if (!enrolled) {
    const error = { code: "academy.enrollments.not_enrolled", message: "Este aluno não está matriculado neste curso." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const validStep = await isValidStepKey(command.lessonId, command.stepKey);
  if (!validStep) {
    const error = { code: "academy.messages.invalid_step_key", message: `Etapa "${command.stepKey}" não existe nesta aula.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const thread = await findOrCreateThread({
    lessonId: command.lessonId,
    stepKey: command.stepKey,
    studentActorId: command.studentActorId,
    type: command.type ?? "correction",
  });
  const message = await insertMessage({ threadId: thread.id, senderRole: "teacher", senderActorId: command.actorId, body: command.body });

  // Aviso push pro aluno (contexts/web-push). Fire-and-forget — nunca falha o envio da mensagem
  // nem espera pelo resultado. Sem chaves VAPID no ambiente, é no-op.
  void sendPushToActor(command.studentActorId, {
    title: "Nova mensagem do professor",
    body: command.body.length > 120 ? `${command.body.slice(0, 117)}…` : command.body,
    url: "/academy/messages",
    tag: `academy-thread-${thread.id}`,
  }).catch(() => undefined);

  endOperation(handle, { success: true });
  return { success: true, data: { threadId: thread.id, message } };
}
