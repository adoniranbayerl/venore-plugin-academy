import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { listLessonSectionsForStudent } from "./service";
import type { ListLessonSectionsForStudentQuery, ListLessonSectionsForStudentResult } from "./types";

export async function listLessonSectionsForStudentHandler(
  query: ListLessonSectionsForStudentQuery,
): Promise<ListLessonSectionsForStudentResult> {
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

  return listLessonSectionsForStudent({ ...query, actorId: currentUser.data.id });
}
