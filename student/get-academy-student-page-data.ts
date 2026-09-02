import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { isPluginActive } from "@venore/plugin-sdk";
import type { AcademyStudentPageGate } from "./types";

// Loader compartilhado por seção (docs/venore-docks.md — regra 13): qualquer página de
// /academy/** chama isto antes de renderizar. Diferente de getAdminPageData, aqui não existe
// permission — só autenticação (qualquer ator logado acessa qualquer curso publicado, decisão já
// registrada no plano desta sessão). Plugin desabilitado é checado antes da sessão: não faz
// sentido mandar um visitante pra tela de login por uma seção que nem existe mais.
export async function getAcademyStudentPageData(): Promise<AcademyStudentPageGate> {
  if (!(await isPluginActive("academy"))) {
    return { granted: false, reason: "plugin_disabled" };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { granted: false, reason: "unauthenticated" };
  }

  return {
    granted: true,
    actor: { id: currentUser.data.id, name: currentUser.data.name, email: currentUser.data.email },
  };
}
