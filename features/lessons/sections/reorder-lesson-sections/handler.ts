import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { reorderLessonSectionsService } from "./service";
import type { ReorderLessonSectionsInput, ReorderLessonSectionsResult } from "./types";

export async function reorderLessonSectionsHandler(
  input: ReorderLessonSectionsInput,
): Promise<ReorderLessonSectionsResult> {
  if (input.lessonId.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.lesson_sections.invalid_lesson_id", message: "lessonId não pode ser vazio." },
    };
  }

  if (input.sectionIds.length === 0) {
    return {
      success: false,
      error: { code: "academy.lesson_sections.invalid_section_ids", message: "sectionIds não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return reorderLessonSectionsService({ ...input, actorId: authz.actorId });
}
