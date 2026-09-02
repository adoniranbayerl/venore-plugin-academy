import { findThreadById, markMessagesRead } from "../../../shared/lesson-messages-store";
import type { MarkThreadReadCommand, MarkThreadReadResult } from "./types";

export async function markThreadRead(command: MarkThreadReadCommand): Promise<MarkThreadReadResult> {
  const thread = await findThreadById(command.threadId);
  if (!thread) {
    return { success: false, error: { code: "academy.messages.thread_not_found", message: `Conversa "${command.threadId}" não encontrada.` } };
  }
  // Só o dono da conversa pode marcá-la como lida — nunca outro aluno usando um threadId alheio.
  if (thread.studentActorId !== command.actorId) {
    return { success: false, error: { code: "academy.messages.forbidden", message: "Esta conversa não pertence a você." } };
  }

  await markMessagesRead(thread.id, "student");
  return { success: true, data: { threadId: thread.id } };
}
