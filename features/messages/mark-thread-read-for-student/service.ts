import { findThreadById, markMessagesRead } from "../../../shared/lesson-messages-store";
import type { MarkThreadReadForStudentInput, MarkThreadReadForStudentResult } from "./types";

export async function markThreadReadForStudent(input: MarkThreadReadForStudentInput): Promise<MarkThreadReadForStudentResult> {
  const thread = await findThreadById(input.threadId);
  if (!thread) {
    return { success: false, error: { code: "academy.messages.thread_not_found", message: `Conversa "${input.threadId}" não encontrada.` } };
  }

  await markMessagesRead(thread.id, "teacher");
  return { success: true, data: { threadId: thread.id } };
}
