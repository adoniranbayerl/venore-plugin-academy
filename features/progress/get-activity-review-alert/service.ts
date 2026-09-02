import { findUnseenReviewedSubmissionsByStudent } from "../../../shared/activity-review-store";
import type { GetActivityReviewAlertInput, GetActivityReviewAlertResult } from "./types";

// Alimenta o badge no user-nav (pedido desta sessão: "quando o aluno recebe uma atualização de
// nota e comentário em atividade, ele também precisa receber notificação"). Só o aluno — professor
// é quem revisa, não há o que alertar pra ele aqui (escopo desta sessão, diferente de
// get-message-alert que também cobre o lado professor). href manda direto pra etapa "activity" da
// aula (ReviewStatusNote já mostra nota/feedback ali, ver activity-form.tsx) — reaproveita o mesmo
// parâmetro `openThread` do deep-link de mensagens (lesson-step-flow.tsx só usa isso pra escolher
// a etapa inicial; sem `openThreadType` nenhum dialog abre sozinho).
export async function getActivityReviewAlert(input: GetActivityReviewAlertInput): Promise<GetActivityReviewAlertResult> {
  if (input.isTeacher) return { success: true, data: null };

  const unseen = await findUnseenReviewedSubmissionsByStudent(input.actorId);
  if (unseen.length === 0) return { success: true, data: null };

  const mostRecent = unseen[0];
  const label = unseen.length > 1 ? `${unseen.length} atividades avaliadas` : "Atividade avaliada";
  const href = `/academy/${mostRecent.courseSlug}/${mostRecent.lessonId}?openThread=activity`;
  return { success: true, data: { count: unseen.length, href, label } };
}
