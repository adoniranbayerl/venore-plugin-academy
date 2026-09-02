import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { listLessonExamplesForStudent } from "./service";
import type { ListLessonExamplesForStudentQuery, ListLessonExamplesForStudentResult } from "./types";

export async function listLessonExamplesForStudentHandler(
  query: ListLessonExamplesForStudentQuery,
): Promise<ListLessonExamplesForStudentResult> {
  if (query.lessonId.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_id", message: "lessonId não pode ser vazio." } };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return listLessonExamplesForStudent({ ...query, actorId: currentUser.data.id });
}
