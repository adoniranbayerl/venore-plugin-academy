"use server";

import { revalidatePath } from "next/cache";
import {
  addLessonActivity,
  addLessonExample,
  addLessonMaterial,
  addQuizQuestion,
  configureLessonRequirements,
  createLessonTextSection,
  deleteLessonActivity,
  deleteLessonExample,
  deleteLessonMaterial,
  deleteLessonSection,
  listLessonActivitySubmissionsForActivity,
  reorderLessonSections,
  reviewLessonActivitySubmission,
  updateLesson,
} from "../../index";
import { getMediaAssetForTrustedReview } from "@venore/plugin-sdk/media";
import { isPluginActive } from "@venore/plugin-sdk";

export type LessonActionState = { error: string | null };

const PLUGIN_DISABLED_ERROR = "O plugin Academy está desabilitado.";

// Mesmo padrão de /admin/cms/actions.ts: erro do handler devolvido de verdade via
// useActionState, nunca descartado silenciosamente (docs/venore-docks.md). Checagem de plugin
// ativo (Fase 6) repetida em cada Server Action porque ela é invocável direto, sem passar pela
// página/gate que a lista — authorizeActor sozinho não sabe que o plugin foi desabilitado.
export async function updateLessonCoverAction(_prevState: LessonActionState, formData: FormData): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const coverMediaId = String(formData.get("coverMediaId") ?? "").trim();

  const result = await updateLesson({ id: lessonId, coverMediaId: coverMediaId || null });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}

// Título/vídeo próprios da aula (pedido desta sessão: texto passou a ser seções via page builder
// do CMS — ver createLessonTextSectionAction abaixo — este form só cobre o que continua flat).
export async function updateLessonContentAction(_prevState: LessonActionState, formData: FormData): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();

  const result = await updateLesson({
    id: lessonId,
    title: title || undefined,
    videoUrl: videoUrl || null,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}

// Cria a seção (entry oculta do CMS + lesson_section) — o texto em si (blocos) é escrito depois
// no builder da entry, pra onde o botão "Editar conteúdo" da seção leva
// (/admin/cms/entries/{cmsEntryId}/builder). Ver create-lesson-text-section/service.ts.
export async function createLessonTextSectionAction(_prevState: LessonActionState, formData: FormData): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  const result = await createLessonTextSection({ lessonId, title });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}

export async function deleteLessonSectionAction(_prevState: LessonActionState, formData: FormData): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const sectionId = String(formData.get("sectionId") ?? "");

  const result = await deleteLessonSection({ id: sectionId });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}

// A nova ordem já vem pronta do client (troca de posição adjacente computada na própria lista
// renderizada, sem round-trip extra) — reorderLessonSections só valida que bate exatamente com o
// conjunto de seções existente.
export async function reorderLessonSectionsAction(_prevState: LessonActionState, formData: FormData): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  let sectionIds: string[];
  try {
    sectionIds = JSON.parse(String(formData.get("sectionIds") ?? "[]"));
  } catch {
    return { error: "Ordem de seções inválida." };
  }

  const result = await reorderLessonSections({ lessonId, sectionIds });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}

export async function addLessonMaterialAction(_prevState: LessonActionState, formData: FormData): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const mediaId = String(formData.get("mediaId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();

  const result = await addLessonMaterial({ lessonId, mediaId, label });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}

export async function deleteLessonMaterialAction(_prevState: LessonActionState, formData: FormData): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const materialId = String(formData.get("materialId") ?? "");

  const result = await deleteLessonMaterial({ id: materialId });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}

// Mesmo padrão de /admin/cms/actions.ts: erro do handler devolvido de verdade via
// useActionState, nunca descartado silenciosamente (docs/venore-docks.md).
export async function configureLessonRequirementsAction(
  _prevState: LessonActionState,
  formData: FormData,
): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const quizEnabled = formData.get("quizEnabled") === "on";
  const quizPassThresholdPercent = String(formData.get("quizPassThresholdPercent") ?? "").trim();
  const quizMaxAttempts = String(formData.get("quizMaxAttempts") ?? "").trim();

  const result = await configureLessonRequirements({
    lessonId,
    readTextEnabled: formData.get("readTextEnabled") === "on",
    watchVideoEnabled: formData.get("watchVideoEnabled") === "on",
    quizEnabled,
    quizPassThresholdPercent: quizEnabled && quizPassThresholdPercent ? Number(quizPassThresholdPercent) : undefined,
    quizMaxAttempts: quizEnabled && quizMaxAttempts ? Number(quizMaxAttempts) : undefined,
    activityEnabled: formData.get("activityEnabled") === "on",
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}

export async function addQuizQuestionAction(_prevState: LessonActionState, formData: FormData): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const options = formData.getAll("options").map((option) => String(option).trim()).filter((option) => option.length > 0);
  const correctOptionIndex = Number(formData.get("correctOptionIndex") ?? "-1");
  const questionKind = formData.get("questionKind") === "audio" ? ("audio" as const) : ("text" as const);
  const promptNotation = String(formData.get("promptNotation") ?? "").trim();

  const result = await addQuizQuestion({
    lessonId,
    text: String(formData.get("text") ?? ""),
    options,
    correctOptionIndex,
    questionKind,
    promptNotation: questionKind === "audio" && promptNotation.length > 0 ? promptNotation : null,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}

export async function addLessonActivityAction(_prevState: LessonActionState, formData: FormData): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");

  const result = await addLessonActivity({
    lessonId,
    title: String(formData.get("title") ?? ""),
    instructionsText: String(formData.get("instructionsText") ?? ""),
    deliverableFormat: String(formData.get("deliverableFormat") ?? "text") as "text" | "audio" | "image" | "pdf",
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}

export async function deleteLessonActivityAction(_prevState: LessonActionState, formData: FormData): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const activityId = String(formData.get("activityId") ?? "");

  const result = await deleteLessonActivity({ id: activityId });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}

export async function addLessonExampleAction(_prevState: LessonActionState, formData: FormData): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const audioMediaId = String(formData.get("audioMediaId") ?? "").trim();
  const sheetMediaId = String(formData.get("sheetMediaId") ?? "").trim();
  const notationData = String(formData.get("notationData") ?? "").trim();

  const result = await addLessonExample({
    lessonId,
    title: String(formData.get("title") ?? ""),
    captionText: String(formData.get("captionText") ?? ""),
    audioMediaId: audioMediaId || undefined,
    sheetMediaId: sheetMediaId || undefined,
    notationData: notationData || undefined,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}

export async function deleteLessonExampleAction(_prevState: LessonActionState, formData: FormData): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const exampleId = String(formData.get("exampleId") ?? "");

  const result = await deleteLessonExample({ id: exampleId });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}

export type SubmissionPanelItem = {
  id: string;
  actorName: string | null;
  actorEmail: string | null;
  contentText: string | null;
  mediaUrl: string | null;
  mediaFilename: string | null;
  reviewStatus: "pending" | "approved" | "needs_revision" | "rejected";
  reviewFeedback: string | null;
  reviewScore: number | null;
  submittedAt: string;
};

// Duas actions abaixo não usam FormData/useActionState — o painel de entregas (client) busca sob
// demanda e revisa por item de uma lista dinâmica, mesmo padrão de media-picker-field.actions.ts
// (server action "de dados", chamada via startTransition, não presa a um <form> fixo).
export async function listActivitySubmissionsAction(activityId: string): Promise<SubmissionPanelItem[]> {
  if (!(await isPluginActive("academy"))) return [];

  const result = await listLessonActivitySubmissionsForActivity({ activityId });
  if (!result.success) return [];

  return Promise.all(
    result.data.map(async (submission) => {
      // Entrega do aluno: sempre "private", dono = aluno — getMediaAsset (escopado) nunca
      // devolveria isso pro professor (nem media.manage tem). listLessonActivitySubmissionsForActivity
      // já checou academy.courses.manage acima, então este é o ponto autorizado pra usar o bypass.
      const media = submission.mediaId ? await getMediaAssetForTrustedReview({ id: submission.mediaId }) : null;
      return {
        id: submission.id,
        actorName: submission.actorName,
        actorEmail: submission.actorEmail,
        contentText: submission.contentText,
        mediaUrl: media?.success && media.data ? media.data.url : null,
        mediaFilename: media?.success && media.data ? media.data.filename : null,
        reviewStatus: submission.reviewStatus,
        reviewFeedback: submission.reviewFeedback,
        reviewScore: submission.reviewScore,
        submittedAt: submission.submittedAt.toISOString(),
      };
    }),
  );
}

export async function reviewSubmissionAction(
  id: string,
  reviewStatus: "approved" | "needs_revision" | "rejected",
  reviewFeedback: string | undefined,
  reviewScore: number | undefined,
  lessonId: string,
): Promise<{ error: string | null }> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const result = await reviewLessonActivitySubmission({ id, reviewStatus, reviewFeedback, reviewScore });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}
