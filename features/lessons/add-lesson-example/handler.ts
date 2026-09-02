import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { addLessonExample } from "./service";
import type { AddLessonExampleInput, AddLessonExampleResult } from "./types";

export async function addLessonExampleHandler(input: AddLessonExampleInput): Promise<AddLessonExampleResult> {
  if (input.lessonId.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_id", message: "lessonId não pode ser vazio." } };
  }

  if (input.title.trim().length === 0) {
    return { success: false, error: { code: "academy.lesson_examples.invalid_title", message: "O título não pode ser vazio." } };
  }

  if (input.captionText.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.lesson_examples.invalid_caption", message: "captionText não pode ser vazio." },
    };
  }

  if (input.notationData !== undefined && input.notationData.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.lesson_examples.invalid_notation", message: "notationData não pode ser vazio." },
    };
  }

  if (!input.audioMediaId && !input.sheetMediaId && !input.notationData) {
    return {
      success: false,
      error: {
        code: "academy.lesson_examples.missing_media",
        message: "É necessário informar audioMediaId, sheetMediaId ou notationData.",
      },
    };
  }

  // Notação ABC já gera visual + áudio sincronizados sozinha (ver comentário em database/schema/
  // index.ts) — misturar com upload estático criaria dois exemplos concorrentes na mesma linha,
  // sem regra de qual prevalece na tela.
  if (input.notationData && (input.audioMediaId || input.sheetMediaId)) {
    return {
      success: false,
      error: {
        code: "academy.lesson_examples.mixed_source",
        message: "notationData não pode ser combinado com audioMediaId/sheetMediaId — escolha um dos dois formatos.",
      },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return addLessonExample({ ...input, actorId: authz.actorId });
}
