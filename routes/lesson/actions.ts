"use server";

import { revalidatePath } from "next/cache";
import {
  getMessageThread,
  markActivityReviewSeen,
  markLessonMaterialRead,
  markLessonSectionRead,
  markTextRead,
  markThreadRead,
  markVideoWatched,
  sendStudentMessage,
  submitLessonActivity,
  submitQuizAttempt,
  type LessonMessageThreadType,
} from "../../index";
import { uploadActivitySubmissionMediaAsset } from "@venore/plugin-sdk/media";
import { isPluginActive } from "@venore/plugin-sdk";

export type LessonActionState = { error: string | null };

const PLUGIN_DISABLED_ERROR = "O plugin Academy está desabilitado.";

function revalidateLesson(courseSlug: string, lessonId: string) {
  revalidatePath(`/academy/${courseSlug}`);
  revalidatePath(`/academy/${courseSlug}/${lessonId}`);
}

// Checagem de plugin ativo (Fase 6) repetida em cada Server Action: invocáveis direto, sem passar
// pelo gate da página (get-academy-course-access.ts) que as renderiza.
export async function markTextReadAction(_prevState: LessonActionState, formData: FormData): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");

  const result = await markTextRead({ lessonId });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidateLesson(courseSlug, lessonId);
  return { error: null };
}

export async function markLessonSectionReadAction(
  _prevState: LessonActionState,
  formData: FormData,
): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");
  const sectionId = String(formData.get("sectionId") ?? "");

  const result = await markLessonSectionRead({ sectionId });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidateLesson(courseSlug, lessonId);
  return { error: null };
}

export async function markLessonMaterialReadAction(
  _prevState: LessonActionState,
  formData: FormData,
): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");
  const materialId = String(formData.get("materialId") ?? "");

  const result = await markLessonMaterialRead({ materialId });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidateLesson(courseSlug, lessonId);
  return { error: null };
}

export async function markVideoWatchedAction(
  _prevState: LessonActionState,
  formData: FormData,
): Promise<LessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");

  const result = await markVideoWatched({ lessonId });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidateLesson(courseSlug, lessonId);
  return { error: null };
}

export type QuizActionState = {
  error: string | null;
  result: { attemptNumber: number; score: number; grade: number; passed: boolean; attemptsRemaining: number } | null;
};

export async function submitQuizAction(_prevState: QuizActionState, formData: FormData): Promise<QuizActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR, result: null };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");
  const questionIds = formData.getAll("questionId").map((value) => String(value));

  const answers = questionIds.map((questionId) => ({
    questionId,
    selectedOptionIndex: Number(formData.get(`answer-${questionId}`) ?? -1),
  }));

  const result = await submitQuizAttempt({ lessonId, answers });
  if (!result.success) {
    return { error: result.error.message, result: null };
  }

  revalidateLesson(courseSlug, lessonId);
  return { error: null, result: result.data };
}

export type ActivitySubmissionState = {
  reviewStatus: "pending" | "approved" | "needs_revision" | "rejected";
  reviewFeedback: string | null;
  reviewScore: number | null;
  contentText: string | null;
  mediaUrl: string | null;
  mediaFilename: string | null;
};
export type SubmitActivityActionState = { error: string | null; submission: ActivitySubmissionState | null };

// deliverableFormat "text"/"none" — os dois únicos que não envolvem arquivo.
export async function submitLessonActivityAction(
  _prevState: SubmitActivityActionState,
  formData: FormData,
): Promise<SubmitActivityActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR, submission: null };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");
  const activityId = String(formData.get("activityId") ?? "");
  const contentText = String(formData.get("contentText") ?? "").trim();

  const result = await submitLessonActivity({ activityId, contentText: contentText || undefined });
  if (!result.success) {
    return { error: result.error.message, submission: null };
  }

  revalidateLesson(courseSlug, lessonId);
  return {
    error: null,
    submission: {
      reviewStatus: result.data.reviewStatus,
      reviewFeedback: result.data.reviewFeedback,
      reviewScore: result.data.reviewScore,
      contentText: result.data.contentText,
      mediaUrl: null,
      mediaFilename: null,
    },
  };
}

// deliverableFormat "audio"/"image"/"pdf" — envia o arquivo pra categoria reservada
// "activity-submissions" (sempre private, dono = próprio aluno) e já aplica como entrega, um só
// passo (mesmo padrão de uploadAvatarAction em account/actions.ts: upload + uso imediato, sem
// passar pelo picker da biblioteca geral). submitLessonActivity valida matrícula/aula acessível/
// atividade habilitada/tipo do arquivo antes de aceitar.
export async function submitLessonActivityFileAction(
  _prevState: SubmitActivityActionState,
  formData: FormData,
): Promise<SubmitActivityActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR, submission: null };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");
  const activityId = String(formData.get("activityId") ?? "");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo para enviar.", submission: null };
  }

  const data = Buffer.from(await file.arrayBuffer());

  const uploadResult = await uploadActivitySubmissionMediaAsset({
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    size: file.size,
    data,
  });
  if (!uploadResult.success) {
    return { error: uploadResult.error.message, submission: null };
  }

  const result = await submitLessonActivity({ activityId, mediaId: uploadResult.data.id });
  if (!result.success) {
    return { error: result.error.message, submission: null };
  }

  revalidateLesson(courseSlug, lessonId);
  return {
    error: null,
    submission: {
      reviewStatus: result.data.reviewStatus,
      reviewFeedback: result.data.reviewFeedback,
      reviewScore: result.data.reviewScore,
      contentText: result.data.contentText,
      mediaUrl: uploadResult.data.url,
      mediaFilename: uploadResult.data.filename,
    },
  };
}

// Disparada pelo client quando a etapa de atividade mostra uma entrega já revisada (activity-
// form.tsx) — mesmo raciocínio de markThreadRead em getLessonMessageThreadAction: exibir a nota/
// feedback já É "ver" a revisão. Silenciosa de propósito (sem LessonActionState/toast): é um
// side-effect de exibição, não uma ação que o aluno pediu.
export async function markActivityReviewSeenAction(activityId: string): Promise<void> {
  if (!(await isPluginActive("academy"))) return;
  await markActivityReviewSeen({ activityId });
}

export type LessonMessageItem = { id: string; senderRole: "student" | "teacher"; body: string; createdAt: string };

// Mesmo padrão "de dados" das actions de submissão/revisão no admin (courses/[id]/enrolled/
// [studentActorId]/actions.ts) — chamadas via startTransition no client, não presas a um <form>
// fixo. markThreadRead é disparado junto (não é erro se não houver nada pra marcar) porque abrir
// o diálogo já É "ler" as respostas do professor, mesmo raciocínio do lado admin.
export async function getLessonMessageThreadAction(lessonId: string, stepKey: string): Promise<LessonMessageItem[]> {
  if (!(await isPluginActive("academy"))) return [];

  const result = await getMessageThread({ lessonId, stepKey });
  if (!result.success) return [];

  if (result.data.thread) {
    await markThreadRead({ threadId: result.data.thread.id });
  }

  return result.data.messages.map((message) => ({
    id: message.id,
    senderRole: message.senderRole,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
  }));
}

export async function sendLessonMessageAction(
  lessonId: string,
  stepKey: string,
  type: LessonMessageThreadType,
  body: string,
): Promise<{ error: string | null; message: LessonMessageItem | null }> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR, message: null };
  }

  const result = await sendStudentMessage({ lessonId, stepKey, type, body });
  if (!result.success) {
    return { error: result.error.message, message: null };
  }

  return {
    error: null,
    message: {
      id: result.data.message.id,
      senderRole: result.data.message.senderRole,
      body: result.data.message.body,
      createdAt: result.data.message.createdAt.toISOString(),
    },
  };
}
