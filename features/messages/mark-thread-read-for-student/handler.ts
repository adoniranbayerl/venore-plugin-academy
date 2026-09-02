import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { markThreadReadForStudent } from "./service";
import type { MarkThreadReadForStudentInput, MarkThreadReadForStudentResult } from "./types";

export async function markThreadReadForStudentHandler(
  input: MarkThreadReadForStudentInput,
): Promise<MarkThreadReadForStudentResult> {
  if (input.threadId.trim().length === 0) {
    return { success: false, error: { code: "academy.messages.invalid_thread_id", message: "threadId não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return markThreadReadForStudent(input);
}
