import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { listCoursesForStudent } from "./service";
import type { ListCoursesForStudentResult } from "./types";

export async function listCoursesForStudentHandler(): Promise<ListCoursesForStudentResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return listCoursesForStudent({ actorId: currentUser.data.id });
}
