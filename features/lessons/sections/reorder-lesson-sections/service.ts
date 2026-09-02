import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { findSectionsByLesson, reorderSections } from "./store";
import type { ReorderLessonSectionsCommand, ReorderLessonSectionsResult } from "./types";

export async function reorderLessonSectionsService(
  command: ReorderLessonSectionsCommand,
): Promise<ReorderLessonSectionsResult> {
  const handle = beginOperation({
    useCase: "academy.reorder-lesson-sections",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findSectionsByLesson(command.lessonId);
  const existingIds = new Set(existing.map((section) => section.id));
  const inputIds = new Set(command.sectionIds);

  const sameSize = existingIds.size === inputIds.size && inputIds.size === command.sectionIds.length;
  const sameMembers = sameSize && command.sectionIds.every((id) => existingIds.has(id));

  if (!sameMembers) {
    const error = {
      code: "academy.lesson_sections.reorder_mismatch",
      message: "A lista enviada não corresponde exatamente às seções desta aula.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const sections = await reorderSections(command.lessonId, command.sectionIds);

  endOperation(handle, { success: true });
  return { success: true, data: sections };
}
