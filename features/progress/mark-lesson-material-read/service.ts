import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { isEnrolled } from "../../../shared/enrollment";
import { insertMaterialCompletionIfMissing, isLessonAccessible } from "../../../shared/lesson-progress";
import { findLessonById, findMaterialById } from "./store";
import type { MarkLessonMaterialReadCommand, MarkLessonMaterialReadResult } from "./types";

// Progresso granular por material (pedido desta sessão) — sem cascata pra nenhum requirement da
// aula: material complementar é opcional por definição, lesson-chain.ts não tem noção dele (ver
// comentário em database/schema/index.ts, lessonMaterialCompletions). Só registra a leitura.
export async function markLessonMaterialRead(command: MarkLessonMaterialReadCommand): Promise<MarkLessonMaterialReadResult> {
  const handle = beginOperation({
    useCase: "academy.mark-lesson-material-read",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const material = await findMaterialById(command.materialId);
  if (!material) {
    const error = {
      code: "academy.lesson_materials.not_found",
      message: `Material "${command.materialId}" não encontrado.`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const lesson = await findLessonById(material.lessonId);
  if (!lesson) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${material.lessonId}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const enrolled = await isEnrolled(lesson.courseId, command.actorId);
  if (!enrolled) {
    const error = { code: "academy.enrollments.not_enrolled", message: "É necessário estar matriculado neste curso." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const accessible = await isLessonAccessible(lesson, command.actorId);
  if (!accessible) {
    const error = { code: "academy.progress.lesson_locked", message: "A aula anterior ainda não foi completada." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await insertMaterialCompletionIfMissing(material.id, command.actorId);

  endOperation(handle, { success: true });
  return { success: true, data: { materialId: material.id, completed: true } };
}
