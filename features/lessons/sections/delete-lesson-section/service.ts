import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { deleteSectionAndRenumber, findSectionById } from "./store";
import type { DeleteLessonSectionCommand, DeleteLessonSectionResult } from "./types";

export async function deleteLessonSectionService(
  command: DeleteLessonSectionCommand,
): Promise<DeleteLessonSectionResult> {
  const handle = beginOperation({
    useCase: "academy.delete-lesson-section",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const section = await findSectionById(command.id);
  if (!section) {
    const error = {
      code: "academy.lesson_sections.not_found",
      message: `Lesson section "${command.id}" não encontrada.`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  // LACUNA CONHECIDA (T1 do modelo de seções): ainda não recusa a exclusão quando há progresso
  // do aluno registrado nesta seção especificamente, porque progresso por seção só passa a
  // existir na T2 — hoje o progresso é só por aula (lesson_text_completions/
  // lesson_video_completions/quiz_attempts, todos com lessonId, não sectionId). Não dá pra
  // inferir "progresso desta seção" a partir do progresso da aula sem gerar falso negativo (ex:
  // aluno completou o vídeo da aula antes desta seção existir). A guarda real entra junto com o
  // schema de progresso por seção na T2.
  // LACUNA ACEITA (pedido de "secao via page builder" desta sessao): quando section.cmsEntryId
  // existe, a entry oculta por tras dela (contexts/cms, internalOwner="academy") NAO e apagada
  // junto -- deleteEntry (CMS) so apaga entry com status "archived", e essas entries nunca passam
  // pelo fluxo de publish/archive (ficam "draft" pra sempre, ver create-lesson-text-section/
  // service.ts). Fica orfa, mas invisivel em /admin/cms/entries -- custo aceito em vez de forcar
  // a entry por um workflow de publicacao que nao faz sentido pra ela.
  await deleteSectionAndRenumber(section.lessonId, section.position, section.id);

  endOperation(handle, { success: true });
  return { success: true, data: { id: section.id } };
}
