import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { listAllMessageThreads } from "./service";
import type { ListAllMessageThreadsResult } from "./types";

// Alimenta /admin/academy/messages (pedido desta sessão: "uma página específica com todas as
// mensagens") — diferente de get-message-alert/handler.ts, aqui a permissão É obrigatória: esta é
// a listagem administrativa completa, não um alerta que precisa funcionar pra qualquer ator.
export async function listAllMessageThreadsHandler(): Promise<ListAllMessageThreadsResult> {
  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listAllMessageThreads();
}
