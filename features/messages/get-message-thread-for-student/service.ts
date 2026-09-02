import { findMessagesByThread, findThreadById } from "./store";
import type { GetMessageThreadForStudentInput, GetMessageThreadForStudentResult } from "./types";

export async function getMessageThreadForStudent(input: GetMessageThreadForStudentInput): Promise<GetMessageThreadForStudentResult> {
  const thread = await findThreadById(input.threadId);
  if (!thread) {
    return { success: false, error: { code: "academy.messages.thread_not_found", message: `Conversa "${input.threadId}" não encontrada.` } };
  }

  const messages = await findMessagesByThread(thread.id);
  return { success: true, data: { thread, messages } };
}
