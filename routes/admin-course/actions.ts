"use server";

import { revalidatePath } from "next/cache";
import { findUserByEmail } from "@venore/plugin-sdk/auth";
import {
  createLesson,
  deleteCourse,
  enrollStudent,
  listActivitySubmissionMediaForCourse,
  publishCourse,
  resetQuizAttempts,
  setLessonStatus,
  unpublishCourse,
  updateCourseSettings,
  type PublishCourseTargetStatus,
} from "../../index";
import { deleteMediaSafely } from "@venore/plugin-sdk/media";
import { isPluginActive } from "@venore/plugin-sdk";

export type CourseActionState = { error: string | null };

const PLUGIN_DISABLED_ERROR = "O plugin Academy está desabilitado.";

export type CreateLessonActionState = { error: string | null; lessonId: string | null };

// Mesmo padrão de /admin/cms/actions.ts: erro do handler devolvido de verdade via
// useActionState, nunca descartado silenciosamente (docs/venore-docks.md). Checagem de plugin
// ativo (Fase 6) repetida em cada Server Action porque ela é invocável direto, sem passar pela
// página/gate que a lista — authorizeActor sozinho não sabe que o plugin foi desabilitado.
//
// Só título — pedido desta sessão ("form de criação de aulas parece deslocado... resto editado
// dentro da aula"): body/videoUrl/coverMediaId/requisitos saíram do form de criação (CreateLessonForm),
// então a composição com configureLessonRequirements que existia aqui não tem mais nenhum campo
// que a alimente — removida, não código morto mantido "por via das dúvidas". Retorna lessonId
// (estado maior que só {error}, mesmo precedente de ClearActivityMediaActionState abaixo) pra
// CreateLessonDialog navegar direto pra página da aula recém-criada.
export async function createLessonAction(_prevState: CreateLessonActionState, formData: FormData): Promise<CreateLessonActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR, lessonId: null };
  }

  const courseId = String(formData.get("courseId") ?? "");

  const result = await createLesson({ courseId, title: String(formData.get("title") ?? "") });

  if (!result.success) {
    return { error: result.error.message, lessonId: null };
  }

  revalidatePath("/admin/academy");
  revalidatePath(`/admin/academy/courses/${courseId}`);
  revalidatePath(`/admin/academy/lessons/${result.data.id}`);
  return { error: null, lessonId: result.data.id };
}

// Um único form/action pro seletor de status do curso (CourseStatusForm) em vez de dois botões —
// draft passa por unpublishCourse (sem validação de conteúdo), restricted/public por publishCourse
// (valida aulas/quiz antes). O barrel expõe as duas operações separadas pra quem quiser chamá-las
// direto; esta action só decide qual delas usar a partir do <select>.
export async function setCourseStatusAction(_prevState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  const result = status === "draft" ? await unpublishCourse({ id }) : await publishCourse({ id, status: status as PublishCourseTargetStatus });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/academy");
  revalidatePath(`/admin/academy/courses/${id}`);
  revalidatePath("/academy");
  revalidatePath(`/academy/${result.data.slug}`);
  return { error: null };
}

// Remove o curso inteiro (aulas, matrículas, progresso, entries de texto). Destrutivo — a UI passa
// por um AlertDialog de confirmação (DeleteCourseButton). Sem revalidatePath da própria página do
// curso: ela deixa de existir, o cliente redireciona pra /admin/academy.
export async function deleteCourseAction(_prevState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const result = await deleteCourse({ id: String(formData.get("courseId") ?? "") });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/academy");
  revalidatePath("/academy");
  return { error: null };
}

export async function updateCourseSettingsAction(
  _prevState: CourseActionState,
  formData: FormData,
): Promise<CourseActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const id = String(formData.get("id") ?? "");
  const coverMediaId = String(formData.get("coverMediaId") ?? "").trim();

  const result = await updateCourseSettings({
    id,
    slug: String(formData.get("slug") ?? "") || undefined,
    publiclyListed: formData.get("publiclyListed") === "on",
    coverMediaId: coverMediaId || null,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/courses/${id}`);
  revalidatePath("/academy");
  revalidatePath(`/academy/${result.data.slug}`);
  return { error: null };
}

export async function enrollStudentAction(_prevState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const courseId = String(formData.get("courseId") ?? "");
  const email = String(formData.get("email") ?? "").trim();

  const userResult = await findUserByEmail({ email });
  if (!userResult.success) {
    return { error: userResult.error.message };
  }

  const result = await enrollStudent({ courseId, studentActorId: userResult.data.id });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/courses/${courseId}`);
  return { error: null };
}

export async function resetQuizAttemptsAction(
  _prevState: CourseActionState,
  formData: FormData,
): Promise<CourseActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const courseId = String(formData.get("courseId") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  const studentActorId = String(formData.get("studentActorId") ?? "");

  const result = await resetQuizAttempts({ lessonId, studentActorId });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/courses/${courseId}`);
  revalidatePath(`/admin/academy/courses/${courseId}/enrolled/${studentActorId}`);
  return { error: null };
}

export type ClearActivityMediaActionState = { error: string | null; clearedCount: number | null };

// Composição fora de academy e media (mesmo motivo de platform/media-lifecycle/delete-media-safely.ts,
// regra 11/14 do documento de arquitetura): academy só sabe listar quais mediaId pertencem às
// entregas de atividade do curso (list-activity-submission-media-for-course, sem cruzar pra
// media); quem decide APAGAR é este ponto de composição no app, que já tem acesso aos dois lados.
// Soft-delete (não purge) de propósito: fica em /admin/media/trash, reversível até o sweep
// automático (media.softDeleteGraceDays) ou uma purga manual — "limpar" não deveria ser
// irreversível na primeira tentativa. confirmed:true porque a intenção aqui já É apagar mídia em
// uso (a única "confirmação" que falta é o clique do professor no botão, coberto pelo diálogo
// client-side em clear-activity-media-button.tsx).
export async function clearActivitySubmissionMediaAction(
  _prevState: ClearActivityMediaActionState,
  formData: FormData,
): Promise<ClearActivityMediaActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR, clearedCount: null };
  }

  const courseId = String(formData.get("courseId") ?? "");

  const mediaResult = await listActivitySubmissionMediaForCourse({ courseId });
  if (!mediaResult.success) {
    return { error: mediaResult.error.message, clearedCount: null };
  }

  const uniqueMediaIds = [...new Set(mediaResult.data.map((item) => item.mediaId))];
  let clearedCount = 0;
  for (const mediaId of uniqueMediaIds) {
    const deleteResult = await deleteMediaSafely({ id: mediaId, confirmed: true });
    if (deleteResult.success) clearedCount++;
  }

  revalidatePath(`/admin/academy/courses/${courseId}`);
  return { error: null, clearedCount };
}

export async function setLessonStatusAction(_prevState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  if (!(await isPluginActive("academy"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const status = String(formData.get("status") ?? "") as "draft" | "restricted" | "public";

  const result = await setLessonStatus({ id, status });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/courses/${courseId}`);
  revalidatePath(`/admin/academy/lessons/${id}`);
  revalidatePath("/academy");
  return { error: null };
}
