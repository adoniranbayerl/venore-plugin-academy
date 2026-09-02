import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { getCourseForStudent } from "./service";
import type { GetCourseForStudentQuery, GetCourseForStudentResult } from "./types";

export async function getCourseForStudentHandler(query: GetCourseForStudentQuery): Promise<GetCourseForStudentResult> {
  const key = "slug" in query ? query.slug : query.id;
  if (key.trim().length === 0) {
    return { success: false, error: { code: "academy.courses.invalid_id", message: "id/slug não pode ser vazio." } };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return getCourseForStudent(query);
}
