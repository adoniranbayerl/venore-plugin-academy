import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { isEnrolled } from "../../../shared/enrollment";
import { isLessonAccessible } from "../../../shared/lesson-progress";
import { findLessonById, findOrCreateThread, insertMessage, isValidStepKey } from "./store";
import type { SendStudentMessageCommand, SendStudentMessageResult } from "./types";

// find-or-create: os dois botões do aluno ("tirar dúvida"/"viu algo errado") caem aqui — se já
// existe uma conversa pra essa etapa, a mensagem entra nela (type da conversa não muda depois de
// criada, ver contracts/types.ts).
export async function sendStudentMessage(command: SendStudentMessageCommand): Promise<SendStudentMessageResult> {
  const handle = beginOperation({
    useCase: "academy.send-student-message",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const lesson = await findLessonById(command.lessonId);
  if (!lesson) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${command.lessonId}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const enrolled = await isEnrolled(lesson.courseId, command.actorId);
  if (!enrolled) {
    const error = { code: "academy.enrollments.not_enrolled", message: "É necessário estar matriculado neste curso." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const accessible = await isLessonAccessible(lesson, command.actorId);
  if (!accessible) {
    const error = { code: "academy.progress.lesson_locked", message: "A aula anterior ainda não foi completada." };
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
    studentActorId: command.actorId,
    type: command.type,
  });
  const message = await insertMessage({ threadId: thread.id, senderRole: "student", senderActorId: command.actorId, body: command.body });

  endOperation(handle, { success: true });
  return { success: true, data: { threadId: thread.id, message } };
}
