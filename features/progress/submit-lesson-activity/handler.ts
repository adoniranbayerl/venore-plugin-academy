import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { submitLessonActivity } from "./service";
import type { SubmitLessonActivityInput, SubmitLessonActivityResult } from "./types";

export async function submitLessonActivityHandler(input: SubmitLessonActivityInput): Promise<SubmitLessonActivityResult> {
  if (input.activityId.trim().length === 0) {
    return { success: false, error: { code: "academy.lesson_activities.invalid_id", message: "activityId não pode ser vazio." } };
  }

  // Sem checagem de "contentText ou mediaId obrigatório" aqui: atividade com deliverableFormat
  // "none" é enviada de propósito sem nenhum dos dois. Só o service sabe o formato esperado
  // (precisa buscar a activity), então a validação de conteúdo mora só lá.
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return submitLessonActivity({ ...input, actorId: currentUser.data.id });
}
