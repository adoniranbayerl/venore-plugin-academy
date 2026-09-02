import { markSubmissionReviewSeen } from "../../../shared/activity-review-store";
import type { MarkActivityReviewSeenCommand, MarkActivityReviewSeenResult } from "./types";

// Sem checagem de "a entrega existe"/"pertence a você" aqui: o UPDATE em markSubmissionReviewSeen
// já é escopado por (activityId, actorId) — actorId vem do usuário autenticado (handler.ts), nunca
// do client, então não há como marcar como vista a entrega de outra pessoa. Chamar sem nada pra
// marcar (entrega inexistente, ainda sem revisão, ou já vista) é um no-op silencioso de propósito,
// mesmo raciocínio de markThreadRead ao abrir uma conversa sem mensagem nova nenhuma.
export async function markActivityReviewSeen(command: MarkActivityReviewSeenCommand): Promise<MarkActivityReviewSeenResult> {
  await markSubmissionReviewSeen(command.activityId, command.actorId);
  return { success: true, data: { activityId: command.activityId } };
}
