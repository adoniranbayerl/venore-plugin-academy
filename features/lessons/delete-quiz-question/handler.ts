import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { deleteQuizQuestionService } from "./service";
import type { DeleteQuizQuestionInput, DeleteQuizQuestionResult } from "./types";

export async function deleteQuizQuestionHandler(input: DeleteQuizQuestionInput): Promise<DeleteQuizQuestionResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "academy.quiz.invalid_id", message: "id não pode ser vazio." } };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteQuizQuestionService({ ...input, actorId: authz.actorId });
}
