import { findAllThreads, findThreadsByStudent } from "../../../shared/lesson-messages-store";
import type { GetMessageAlertInput, GetMessageAlertResult } from "./types";

// Alimenta o badge no user-nav (pedido desta sessão: "bolinha de pulse e um texto 'Nova
// mensagem'"). Professor (isTeacher, resolvido no handler via academy.courses.manage) sempre vê
// o total agregado de TODOS os cursos, apontando pra página administrativa nova
// (list-all-message-threads); aluno vê só as próprias threads, apontando direto pra etapa da
// thread não-lida mais recente (deep link — ver comentário em lesson-step-flow.tsx sobre
// initialStepId/autoOpenMessage).
export async function getMessageAlert(input: GetMessageAlertInput): Promise<GetMessageAlertResult> {
  if (input.isTeacher) {
    const threads = await findAllThreads();
    const totalUnread = threads.reduce((sum, thread) => sum + thread.unreadCount, 0);
    if (totalUnread === 0) return { success: true, data: null };
    const label = totalUnread > 1 ? `${totalUnread} novas mensagens` : "Nova mensagem";
    return { success: true, data: { count: totalUnread, href: "/admin/academy/messages", label } };
  }

  const threads = await findThreadsByStudent(input.actorId);
  const unreadThreads = threads.filter((thread) => thread.unreadCount > 0);
  if (unreadThreads.length === 0) return { success: true, data: null };

  const totalUnread = unreadThreads.reduce((sum, thread) => sum + thread.unreadCount, 0);
  // findThreadsByStudent já ordena por lastMessageAt desc — a primeira não-lida é a mais recente.
  const mostRecent = unreadThreads[0];
  const href = `/academy/${mostRecent.courseSlug}/${mostRecent.lessonId}?openThread=${mostRecent.stepKey}&openThreadType=${mostRecent.type}`;
  const label = totalUnread > 1 ? `${totalUnread} novas mensagens` : "Nova mensagem";
  return { success: true, data: { count: totalUnread, href, label } };
}
