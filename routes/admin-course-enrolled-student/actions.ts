"use server";

import { revalidatePath } from "next/cache";
import { getMediaAssetForTrustedReview } from "@venore/plugin-sdk/media";
import {
  getMessageThreadForStudent,
  listLessonActivitySubmissionsForStudentInCourse,
  markThreadReadForStudent,
  reviewLessonActivitySubmission,
  sendTeacherMessage,
  type LessonMessageThreadType,
} from "../../index";
import { isPluginActive } from "@venore/plugin-sdk";

const PLUGIN_DISABLED_ERROR = "O plugin Academy está desabilitado.";

export type StudentSubmissionItem = {
  id: string;
  lessonId: string;
  lessonTitle: string;
  lessonPosition: number;
  activityTitle: string;
  activityPosition: number;
  contentText: string | null;
  mediaUrl: string | null;
  mediaFilename: string | null;
  reviewStatus: "pending" | "approved" | "needs_revision" | "rejected";
  reviewFeedback: string | null;
  reviewScore: number | null;
  submittedAt: string;
};

// Mesmo padrão de listActivitySubmissionsAction (lessons/[id]/actions.ts) — server action "de
// dados" chamada via startTransition no client, não presa a um <form> fixo. mediaUrl resolvido
// aqui (getMediaAssetForTrustedReview, mesmo bypass já usado lá: entrega do aluno é sempre
// "private", dono = aluno, listLessonActivitySubmissionsForStudentInCourse já checou
// academy.courses.manage) em vez de na página, pra não pagar o custo de resolver mídia de toda
// entrega logo no primeiro load — só quando o professor abre a lista de um aluno.
export async function listStudentSubmissionsAction(courseId: string, studentActorId: string): Promise<StudentSubmissionItem[]> {
  if (!(await isPluginActive("academy"))) return [];

  const result = await listLessonActivitySubmissionsForStudentInCourse({ courseId, studentActorId });
  if (!result.success) return [];

  return Promise.all(
    result.data.map(async (submission) => {
      const media = submission.mediaId ? await getMediaAssetForTrustedReview({ id: submission.mediaId }) : null;
      return {
        id: submission.id,
        lessonId: submission.lessonId,
        lessonTitle: submission.lessonTitle,
        lessonPosition: submission.lessonPosition,
        activityTitle: submission.activityTitle,
        activityPosition: submission.activityPosition,
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

export async function reviewStudentSubmissionAction(
  id: string,
  reviewStatus: "approved" | "needs_revision" | "rejected",
  reviewFeedback: string | undefined,
  reviewScore: number | undefined,
  courseId: string,
  studentActorId: string,
): Promise<{ error: string | null }> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const result = await reviewLessonActivitySubmission({ id, reviewStatus, reviewFeedback, reviewScore });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/courses/${courseId}/enrolled/${studentActorId}`);
  return { error: null };
}

export type TeacherMessageItem = { id: string; senderRole: "student" | "teacher"; body: string; createdAt: string };

// Mesmo padrão "de dados" das duas actions acima — MessageThreadPanel busca sob demanda (só
// quando o professor abre uma conversa específica) e marca como lida na mesma hora (mirando o
// mesmo "abrir = ler" de ActivitySubmissionsPanel, sem botão de confirmação separado).
export async function getMessageThreadForStudentAction(threadId: string): Promise<TeacherMessageItem[]> {
  if (!(await isPluginActive("academy"))) return [];

  const result = await getMessageThreadForStudent({ threadId });
  if (!result.success) return [];

  await markThreadReadForStudent({ threadId });

  return result.data.messages.map((message) => ({
    id: message.id,
    senderRole: message.senderRole,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
  }));
}

export async function sendTeacherMessageAction(
  lessonId: string,
  stepKey: string,
  studentActorId: string,
  body: string,
  courseId: string,
  type?: LessonMessageThreadType,
): Promise<{ error: string | null; message: TeacherMessageItem | null }> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR, message: null };
  }

  const result = await sendTeacherMessage({ lessonId, stepKey, studentActorId, body, type });
  if (!result.success) {
    return { error: result.error.message, message: null };
  }

  revalidatePath(`/admin/academy/courses/${courseId}/enrolled/${studentActorId}`);
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
