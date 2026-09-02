import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { getMessageAlert } from "./service";
import type { GetMessageAlertResult } from "./types";

// Roda pra QUALQUER ator autenticado, nunca retorna erro de permissão — vira o badge do header
// (platform/notifications/notification-registry.ts), que só espera "sem alerta" (data: null)
// quando o ator não tem nada pra ver. authorizeActor aqui só decide QUAL consulta rodar (professor
// vs. aluno), nunca bloqueia a chamada — comportamento deliberadamente diferente de
// list-all-message-threads/handler.ts, que É uma página administrativa de verdade.
export async function getMessageAlertHandler(): Promise<GetMessageAlertResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { success: true, data: null };
  }

  const authz = await authorizeActor("academy.courses.manage");
  return getMessageAlert({ actorId: currentUser.data.id, isTeacher: authz.authorized });
}
