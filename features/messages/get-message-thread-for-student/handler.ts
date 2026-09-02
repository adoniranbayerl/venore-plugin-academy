import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { getMessageThreadForStudent } from "./service";
import type { GetMessageThreadForStudentInput, GetMessageThreadForStudentResult } from "./types";

export async function getMessageThreadForStudentHandler(
  input: GetMessageThreadForStudentInput,
): Promise<GetMessageThreadForStudentResult> {
  if (input.threadId.trim().length === 0) {
    return { success: false, error: { code: "academy.messages.invalid_thread_id", message: "threadId não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return getMessageThreadForStudent(input);
}
