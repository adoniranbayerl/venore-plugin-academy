import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { updateQuizQuestionService } from "./service";
import type { UpdateQuizQuestionInput, UpdateQuizQuestionResult } from "./types";

export async function updateQuizQuestionHandler(input: UpdateQuizQuestionInput): Promise<UpdateQuizQuestionResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "academy.quiz.invalid_id", message: "id não pode ser vazio." } };
  }

  if (input.text !== undefined && input.text.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.quiz.invalid_text", message: "O texto da pergunta não pode ser vazio." },
    };
  }

  if (input.options !== undefined && input.options.length < 2) {
    return {
      success: false,
      error: { code: "academy.quiz.invalid_options", message: "A pergunta precisa de pelo menos 2 opções." },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateQuizQuestionService({ ...input, actorId: authz.actorId });
}
