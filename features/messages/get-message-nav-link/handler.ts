import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { getMessageNavLink } from "./service";
import type { GetMessageNavLinkResult } from "./types";

// Mesmo racional de get-message-alert/handler.ts: roda pra qualquer ator autenticado, nunca
// devolve erro de permissão — alimenta o item "Mensagens" do user-nav
// (platform/user-nav/registry.ts). authorizeActor aqui só decide o href (professor vs. aluno).
// Anônimo → data: null (nada no menu).
export async function getMessageNavLinkHandler(): Promise<GetMessageNavLinkResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { success: true, data: null };
  }

  const authz = await authorizeActor("academy.courses.manage");
  return getMessageNavLink({ isTeacher: authz.authorized });
}
