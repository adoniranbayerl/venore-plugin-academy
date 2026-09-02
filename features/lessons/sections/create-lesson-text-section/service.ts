import { randomUUID } from "node:crypto";
import { createEntry, getOrCreateReservedContentType } from "@venore/plugin-sdk/cms";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { createLessonSectionService } from "../create-lesson-section/service";
import type { CreateLessonTextSectionCommand, CreateLessonTextSectionResult } from "./types";

const ACADEMY_CONTENT_TYPE_KEY = "academy";
const ACADEMY_CONTENT_TYPE_NAME = "Academy (interno)";

// Pedido desta sessão: seção de texto da aula usa o page builder do CMS (entries + composição de
// blocos, contexts/cms), tratada como um "conteúdo" de verdade — só nunca aparece em
// /admin/cms/entries (internalOwner, ver contexts/cms/database/schema/index.ts). Cria a entry
// oculta e a lesson_section que aponta pra ela numa única operação; o texto em si (blocos) é
// escrito depois, no builder da própria entry (/admin/cms/entries/{id}/builder) — este use case só
// prepara o par entry+seção, não o conteúdo.
//
// A entry criada fica sempre "draft" (nunca passa pelo fluxo de publish/archive do CMS — não faz
// sentido pra um pedaço de aula) — por isso delete-lesson-section (que exige archived pra apagar
// via CMS) não tenta apagar a entry junto quando a seção é removida; ela fica órfã, oculta da
// listagem, mesmo trade-off aceito documentado ali.
export async function createLessonTextSection(command: CreateLessonTextSectionCommand): Promise<CreateLessonTextSectionResult> {
  const handle = beginOperation({
    useCase: "academy.create-lesson-text-section",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const contentType = await getOrCreateReservedContentType(ACADEMY_CONTENT_TYPE_KEY, ACADEMY_CONTENT_TYPE_NAME);

  const entryResult = await createEntry({
    contentTypeIds: [contentType.id],
    title: command.title,
    slug: `academy-section-${randomUUID()}`,
    internalOwner: "academy",
  });

  if (!entryResult.success) {
    endOperation(handle, { success: false, error: entryResult.error });
    return entryResult;
  }

  const sectionResult = await createLessonSectionService({
    lessonId: command.lessonId,
    title: command.title,
    cmsEntryId: entryResult.data.id,
    actorId: command.actorId,
  });

  endOperation(handle, sectionResult.success ? { success: true } : { success: false, error: sectionResult.error });
  return sectionResult;
}
