import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { deleteLessonMaterial, findLessonMaterialById } from "./store";
import type { DeleteLessonMaterialCommand, DeleteLessonMaterialResult } from "./types";

export async function deleteLessonMaterialService(command: DeleteLessonMaterialCommand): Promise<DeleteLessonMaterialResult> {
  const handle = beginOperation({
    useCase: "academy.delete-lesson-material",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const material = await findLessonMaterialById(command.id);
  if (!material) {
    const error = { code: "academy.lesson_materials.not_found", message: `Material "${command.id}" não encontrado.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await deleteLessonMaterial(material.id);

  endOperation(handle, { success: true });
  return { success: true, data: { id: material.id } };
}
